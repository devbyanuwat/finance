import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { Budget, BudgetInsert, BudgetUpdate, BudgetWithCategory } from '@/types/database.types'

export function useBudgets() {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState<BudgetWithCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBudgets = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      // Fetch budgets with categories
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (budgetsError) throw budgetsError

      // Calculate spent amount for each budget
      const budgetsWithSpent = await Promise.all(
        (budgetsData || []).map(async (budget) => {
          const spent = await calculateSpent(budget)
          return { ...budget, spent }
        })
      )

      setBudgets(budgetsWithSpent)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Calculate spent amount for a budget based on period
  const calculateSpent = async (budget: Budget): Promise<number> => {
    if (!user) return 0

    const now = new Date()
    let startDate: Date
    let endDate: Date

    if (budget.period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    } else {
      startDate = new Date(now.getFullYear(), 0, 1)
      endDate = new Date(now.getFullYear(), 11, 31)
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('category_id', budget.category_id)
      .eq('type', 'expense')
      .gte('transaction_date', startDate.toISOString().split('T')[0])
      .lte('transaction_date', endDate.toISOString().split('T')[0])

    if (error) return 0

    return (data || []).reduce((sum, t) => sum + t.amount, 0)
  }

  useEffect(() => {
    fetchBudgets()
  }, [fetchBudgets])

  const createBudget = async (data: Omit<BudgetInsert, 'user_id'>) => {
    if (!user) throw new Error('ไม่พบผู้ใช้')

    // Check if budget already exists for this category and period
    const { data: existing } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', user.id)
      .eq('category_id', data.category_id)
      .eq('period', data.period)
      .single()

    if (existing) {
      throw new Error('มีงบประมาณสำหรับหมวดหมู่นี้อยู่แล้ว')
    }

    const { data: newBudget, error } = await supabase
      .from('budgets')
      .insert({
        ...data,
        user_id: user.id,
      })
      .select(`
        *,
        category:categories(*)
      `)
      .single()

    if (error) throw error

    const spent = await calculateSpent(newBudget)
    const budgetWithSpent = { ...newBudget, spent }

    setBudgets((prev) => [budgetWithSpent, ...prev])
    return budgetWithSpent
  }

  const updateBudget = async (id: string, data: BudgetUpdate) => {
    const { data: updated, error } = await supabase
      .from('budgets')
      .update(data)
      .eq('id', id)
      .select(`
        *,
        category:categories(*)
      `)
      .single()

    if (error) throw error

    const spent = await calculateSpent(updated)
    const budgetWithSpent = { ...updated, spent }

    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? budgetWithSpent : b))
    )
    return budgetWithSpent
  }

  const deleteBudget = async (id: string) => {
    const { error } = await supabase.from('budgets').delete().eq('id', id)

    if (error) throw error

    setBudgets((prev) => prev.filter((b) => b.id !== id))
  }

  // Summary stats
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0)
  const budgetsOverThreshold = budgets.filter(
    (b) => b.spent && (b.spent / b.amount) * 100 >= b.alert_threshold
  ).length

  return {
    budgets,
    isLoading,
    error,
    totalBudget,
    totalSpent,
    budgetsOverThreshold,
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
  }
}
