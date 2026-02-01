import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from './useSupabase'
import { useAuth } from './useAuth'
import type { Transaction, TransactionInsert, TransactionUpdate, TransactionType, TransactionWithRelations } from '@/types/database.types'

export interface TransactionFilters {
  type?: TransactionType
  account_id?: string
  category_id?: string
  startDate?: Date
  endDate?: Date
  search?: string
}

export function useTransactions(filters?: TransactionFilters) {
  const { user } = useAuth()
  const supabase = useSupabase()
  const [transactions, setTransactions] = useState<TransactionWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      let query = supabase
        .from('transactions')
        .select(`
          *,
          account:accounts!account_id(*),
          category:categories(*),
          to_account:accounts!to_account_id(*),
          debt:debts(*)
        `)
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (filters?.type) {
        query = query.eq('type', filters.type)
      }

      if (filters?.account_id) {
        query = query.or(`account_id.eq.${filters.account_id},to_account_id.eq.${filters.account_id}`)
      }

      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id)
      }

      if (filters?.startDate) {
        query = query.gte('transaction_date', filters.startDate.toISOString().split('T')[0])
      }

      if (filters?.endDate) {
        query = query.lte('transaction_date', filters.endDate.toISOString().split('T')[0])
      }

      if (filters?.search) {
        query = query.ilike('description', `%${filters.search}%`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setTransactions(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase, filters?.type, filters?.account_id, filters?.category_id, filters?.startDate, filters?.endDate, filters?.search])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const createTransaction = async (data: Omit<TransactionInsert, 'user_id'>) => {
    if (!user) throw new Error('ไม่พบผู้ใช้')

    const { data: newTransaction, error } = await supabase
      .from('transactions')
      .insert({
        ...data,
        user_id: user.id,
        transaction_date: data.transaction_date,
        status: data.status || 'completed',
      })
      .select(`
        *,
        account:accounts!account_id(*),
        category:categories(*),
        to_account:accounts!to_account_id(*),
        debt:debts(*)
      `)
      .single()

    if (error) throw error

    // Only update account balances if status is 'completed'
    if (newTransaction.status === 'completed') {
      await updateAccountBalances(data.type, data.account_id, data.to_account_id ?? null, data.amount, 'add')
    }

    setTransactions((prev) => [newTransaction, ...prev])
    return newTransaction
  }

  const updateTransaction = async (id: string, oldData: Transaction, newData: TransactionUpdate) => {
    // Revert old transaction effect on balances only if it was completed
    if (oldData.status === 'completed') {
      await updateAccountBalances(oldData.type, oldData.account_id, oldData.to_account_id, oldData.amount, 'remove')
    }

    const { data: updated, error } = await supabase
      .from('transactions')
      .update(newData)
      .eq('id', id)
      .select(`
        *,
        account:accounts!account_id(*),
        category:categories(*),
        to_account:accounts!to_account_id(*),
        debt:debts(*)
      `)
      .single()

    if (error) throw error

    // Apply new transaction effect on balances only if status is 'completed'
    const newStatus = newData.status ?? oldData.status
    if (newStatus === 'completed') {
      await updateAccountBalances(
        newData.type || oldData.type,
        newData.account_id || oldData.account_id,
        newData.to_account_id ?? oldData.to_account_id,
        newData.amount || oldData.amount,
        'add'
      )
    }

    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? updated : t))
    )
    return updated
  }

  const deleteTransaction = async (transaction: Transaction) => {
    const { error } = await supabase.from('transactions').delete().eq('id', transaction.id)

    if (error) throw error

    // Revert balance changes only if transaction was completed
    if (transaction.status === 'completed') {
      await updateAccountBalances(
        transaction.type,
        transaction.account_id,
        transaction.to_account_id,
        transaction.amount,
        'remove'
      )
    }

    setTransactions((prev) => prev.filter((t) => t.id !== transaction.id))
  }

  const updateAccountBalances = async (
    type: TransactionType,
    accountId: string,
    toAccountId: string | null,
    amount: number,
    operation: 'add' | 'remove'
  ) => {
    const multiplier = operation === 'add' ? 1 : -1

    // Get current account balance
    const getBalance = async (id: string) => {
      const { data } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', id)
        .single()
      return data?.balance || 0
    }

    if (type === 'income') {
      const currentBalance = await getBalance(accountId)
      await supabase
        .from('accounts')
        .update({ balance: currentBalance + amount * multiplier })
        .eq('id', accountId)
    } else if (type === 'expense') {
      const currentBalance = await getBalance(accountId)
      await supabase
        .from('accounts')
        .update({ balance: currentBalance - amount * multiplier })
        .eq('id', accountId)
    } else if (type === 'transfer' && toAccountId) {
      const [sourceBalance, destBalance] = await Promise.all([
        getBalance(accountId),
        getBalance(toAccountId),
      ])
      await Promise.all([
        supabase
          .from('accounts')
          .update({ balance: sourceBalance - amount * multiplier })
          .eq('id', accountId),
        supabase
          .from('accounts')
          .update({ balance: destBalance + amount * multiplier })
          .eq('id', toAccountId),
      ])
    }
  }

  // Summary calculations (only count completed transactions)
  const totalIncome = transactions
    .filter((t) => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter((t) => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const netAmount = totalIncome - totalExpense

  // Pending transactions count
  const pendingCount = transactions.filter((t) => t.status === 'pending').length

  return {
    transactions,
    isLoading,
    error,
    totalIncome,
    totalExpense,
    netAmount,
    pendingCount,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  }
}
