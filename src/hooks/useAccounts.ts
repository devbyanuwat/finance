import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { Account, AccountInsert, AccountUpdate } from '@/types/database.types'

export function useAccounts() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setAccounts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const createAccount = async (data: Omit<AccountInsert, 'user_id'>) => {
    if (!user) throw new Error('ไม่พบผู้ใช้')

    const { data: newAccount, error } = await supabase
      .from('accounts')
      .insert({ ...data, user_id: user.id })
      .select()
      .single()

    if (error) throw error

    setAccounts((prev) => [newAccount, ...prev])
    return newAccount
  }

  const updateAccount = async (id: string, data: AccountUpdate) => {
    const { data: updated, error } = await supabase
      .from('accounts')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    setAccounts((prev) =>
      prev.map((account) => (account.id === id ? updated : account))
    )
    return updated
  }

  const deleteAccount = async (id: string) => {
    const { error } = await supabase.from('accounts').delete().eq('id', id)

    if (error) throw error

    setAccounts((prev) => prev.filter((account) => account.id !== id))
  }

  const totalBalance = accounts
    .filter((a) => a.is_active)
    .reduce((sum, account) => {
      // Credit cards have negative balance (debt)
      if (account.type === 'credit_card') {
        return sum - account.balance
      }
      return sum + account.balance
    }, 0)

  const totalAssets = accounts
    .filter((a) => a.is_active && a.type !== 'credit_card')
    .reduce((sum, account) => sum + account.balance, 0)

  const totalLiabilities = accounts
    .filter((a) => a.is_active && a.type === 'credit_card')
    .reduce((sum, account) => sum + account.balance, 0)

  return {
    accounts,
    isLoading,
    error,
    totalBalance,
    totalAssets,
    totalLiabilities,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
  }
}
