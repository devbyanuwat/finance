import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from './useSupabase'
import { useAuth } from './useAuth'
import type {
  Debt,
  DebtStatus,
  DebtWithRelations,
  Transaction,
} from '@/types/database.types'

export function useDebts() {
  const { user } = useAuth()
  const supabase = useSupabase()
  const [debts, setDebts] = useState<DebtWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDebts = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('debts')
        .select(`
          *,
          account:accounts(*),
          category:categories(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setDebts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchDebts()
  }, [fetchDebts])

  const createDebt = async (data: {
    name: string
    debt_type: Debt['debt_type']
    total_amount: number
    installment_count: number
    interest_rate: number
    creditor_name: string | null
    account_id: string | null
    category_id: string | null
    due_day: number | null
    start_date: string
    note: string | null
  }) => {
    if (!user) throw new Error('ไม่พบผู้ใช้')

    const totalWithInterest = data.total_amount * (1 + data.interest_rate / 100)
    const monthlyPayment = Math.round((totalWithInterest / data.installment_count) * 100) / 100
    const startDate = new Date(data.start_date)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + data.installment_count - 1)

    // 1. Insert debt
    const { data: newDebt, error: debtError } = await supabase
      .from('debts')
      .insert({
        user_id: user.id,
        name: data.name,
        debt_type: data.debt_type,
        total_amount: data.total_amount,
        monthly_payment: monthlyPayment,
        installment_count: data.installment_count,
        paid_count: 0,
        remaining_amount: Math.round(totalWithInterest * 100) / 100,
        interest_rate: data.interest_rate,
        creditor_name: data.creditor_name,
        account_id: data.account_id,
        category_id: data.category_id,
        due_day: data.due_day,
        start_date: data.start_date,
        end_date: endDate.toISOString().split('T')[0],
        status: 'active' as DebtStatus,
        note: data.note,
      })
      .select(`*, account:accounts(*), category:categories(*)`)
      .single()

    if (debtError) throw debtError

    // 2. Auto-generate pending transactions
    const transactions = []
    for (let i = 0; i < data.installment_count; i++) {
      const dueDate = new Date(startDate)
      dueDate.setMonth(dueDate.getMonth() + i)

      if (data.due_day) {
        const lastDay = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate()
        dueDate.setDate(Math.min(data.due_day, lastDay))
      }

      // Last installment adjusts for rounding
      let amount = monthlyPayment
      if (i === data.installment_count - 1) {
        const paidSoFar = monthlyPayment * (data.installment_count - 1)
        amount = Math.round((totalWithInterest - paidSoFar) * 100) / 100
      }

      transactions.push({
        user_id: user.id,
        account_id: data.account_id || '',
        category_id: data.category_id || null,
        type: 'expense' as const,
        amount,
        description: `${data.name} (${i + 1}/${data.installment_count})`,
        note: null,
        tags: null,
        receipt_url: null,
        transaction_date: dueDate.toISOString().split('T')[0],
        status: 'pending' as const,
        is_recurring: false,
        recurring_rule: null,
        debt_id: newDebt.id,
      })
    }

    if (transactions.length > 0) {
      const { error: txError } = await supabase
        .from('transactions')
        .insert(transactions)
      if (txError) throw txError
    }

    setDebts((prev) => [newDebt, ...prev])
    return newDebt
  }

  const updateDebt = async (id: string, data: Partial<Debt>) => {
    const { data: updated, error } = await supabase
      .from('debts')
      .update(data)
      .eq('id', id)
      .select(`*, account:accounts(*), category:categories(*)`)
      .single()

    if (error) throw error
    setDebts((prev) => prev.map((d) => (d.id === id ? updated : d)))
    return updated
  }

  const markPayment = async (debtId: string, transactionId: string) => {
    const debt = debts.find((d) => d.id === debtId)
    if (!debt) throw new Error('ไม่พบข้อมูลหนี้')

    // Get transaction
    const { data: tx, error: txFetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single()
    if (txFetchError) throw txFetchError

    // Update transaction status
    const { error: txError } = await supabase
      .from('transactions')
      .update({ status: 'completed' })
      .eq('id', transactionId)
    if (txError) throw txError

    // Update account balance if transaction was pending
    if (tx.account_id && tx.status === 'pending') {
      const { data: account } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', tx.account_id)
        .single()

      if (account) {
        await supabase
          .from('accounts')
          .update({ balance: account.balance - tx.amount })
          .eq('id', tx.account_id)
      }
    }

    // Update debt counters
    const newPaidCount = debt.paid_count + 1
    const newRemaining = Math.max(debt.remaining_amount - tx.amount, 0)
    const newStatus: DebtStatus = newPaidCount >= debt.installment_count ? 'completed' : 'active'

    const { data: updated, error: debtError } = await supabase
      .from('debts')
      .update({
        paid_count: newPaidCount,
        remaining_amount: Math.round(newRemaining * 100) / 100,
        status: newStatus,
      })
      .eq('id', debtId)
      .select(`*, account:accounts(*), category:categories(*)`)
      .single()

    if (debtError) throw debtError
    setDebts((prev) => prev.map((d) => (d.id === debtId ? updated : d)))
    return updated
  }

  const convertToInstallment = async (
    debtId: string,
    newInstallmentCount: number,
    newInterestRate: number = 0
  ) => {
    const debt = debts.find((d) => d.id === debtId)
    if (!debt) throw new Error('ไม่พบข้อมูลหนี้')

    // Cancel existing pending transactions
    await supabase
      .from('transactions')
      .update({ status: 'cancelled' })
      .eq('debt_id', debtId)
      .eq('status', 'pending')

    // Calculate new schedule
    const totalWithInterest = debt.total_amount * (1 + newInterestRate / 100)
    const monthlyPayment = Math.round((totalWithInterest / newInstallmentCount) * 100) / 100
    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + newInstallmentCount - 1)

    // Update debt
    const { data: updated, error: debtError } = await supabase
      .from('debts')
      .update({
        debt_type: 'credit_card_installment',
        installment_count: newInstallmentCount,
        interest_rate: newInterestRate,
        monthly_payment: monthlyPayment,
        remaining_amount: Math.round(totalWithInterest * 100) / 100,
        paid_count: 0,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      })
      .eq('id', debtId)
      .select(`*, account:accounts(*), category:categories(*)`)
      .single()

    if (debtError) throw debtError

    // Generate new pending transactions
    const transactions = []
    for (let i = 0; i < newInstallmentCount; i++) {
      const dueDate = new Date(startDate)
      dueDate.setMonth(dueDate.getMonth() + i)

      if (debt.due_day) {
        const lastDay = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate()
        dueDate.setDate(Math.min(debt.due_day, lastDay))
      }

      let amount = monthlyPayment
      if (i === newInstallmentCount - 1) {
        const paidSoFar = monthlyPayment * (newInstallmentCount - 1)
        amount = Math.round((totalWithInterest - paidSoFar) * 100) / 100
      }

      transactions.push({
        user_id: debt.user_id,
        account_id: debt.account_id || '',
        category_id: debt.category_id || null,
        type: 'expense' as const,
        amount,
        description: `${debt.name} (${i + 1}/${newInstallmentCount})`,
        note: 'แปลงจากชำระเต็มจำนวนเป็นผ่อนชำระ',
        tags: null,
        receipt_url: null,
        transaction_date: dueDate.toISOString().split('T')[0],
        status: 'pending' as const,
        is_recurring: false,
        recurring_rule: null,
        debt_id: debtId,
      })
    }

    if (transactions.length > 0) {
      const { error: txError } = await supabase
        .from('transactions')
        .insert(transactions)
      if (txError) throw txError
    }

    setDebts((prev) => prev.map((d) => (d.id === debtId ? updated : d)))
    return updated
  }

  const cancelDebt = async (debtId: string) => {
    await supabase
      .from('transactions')
      .update({ status: 'cancelled' })
      .eq('debt_id', debtId)
      .eq('status', 'pending')

    const { data: updated, error } = await supabase
      .from('debts')
      .update({ status: 'cancelled' })
      .eq('id', debtId)
      .select(`*, account:accounts(*), category:categories(*)`)
      .single()

    if (error) throw error
    setDebts((prev) => prev.map((d) => (d.id === debtId ? updated : d)))
    return updated
  }

  const deleteDebt = async (debtId: string) => {
    await supabase
      .from('transactions')
      .delete()
      .eq('debt_id', debtId)
      .eq('status', 'pending')

    const { error } = await supabase.from('debts').delete().eq('id', debtId)
    if (error) throw error

    setDebts((prev) => prev.filter((d) => d.id !== debtId))
  }

  const getDebtTransactions = async (debtId: string): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('debt_id', debtId)
      .order('transaction_date', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Summary calculations
  const activeDebts = debts.filter((d) => d.status === 'active')
  const totalDebt = activeDebts.reduce((sum, d) => sum + d.remaining_amount, 0)
  const monthlyObligation = activeDebts.reduce((sum, d) => sum + d.monthly_payment, 0)

  const today = new Date()
  const thirtyDaysLater = new Date(today)
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)

  const upcomingPayments = activeDebts.filter((d) => {
    if (!d.due_day) return false
    const nextDue = new Date(today.getFullYear(), today.getMonth(), d.due_day)
    if (nextDue < today) nextDue.setMonth(nextDue.getMonth() + 1)
    return nextDue <= thirtyDaysLater
  })

  return {
    debts,
    isLoading,
    error,
    totalDebt,
    monthlyObligation,
    upcomingPayments,
    activeDebts,
    fetchDebts,
    createDebt,
    updateDebt,
    markPayment,
    convertToInstallment,
    cancelDebt,
    deleteDebt,
    getDebtTransactions,
  }
}
