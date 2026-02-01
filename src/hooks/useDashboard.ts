import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from './useSupabase'
import { useAuth } from './useAuth'
import type { TransactionWithRelations, BudgetWithCategory, Account } from '@/types/database.types'

interface MonthlyData {
  month: string
  income: number
  expense: number
}

interface CategorySpending {
  name: string
  amount: number
  color: string
}

interface DashboardData {
  totalBalance: number
  monthlyIncome: number
  monthlyExpense: number
  monthlySavings: number
  recentTransactions: TransactionWithRelations[]
  budgetAlerts: BudgetWithCategory[]
  monthlyTrend: MonthlyData[]
  categorySpending: CategorySpending[]
  accounts: Account[]
}

export function useDashboard() {
  const { user } = useAuth()
  const supabase = useSupabase()
  const [data, setData] = useState<DashboardData>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    monthlySavings: 0,
    recentTransactions: [],
    budgetAlerts: [],
    monthlyTrend: [],
    categorySpending: [],
    accounts: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      const trendStart = new Date(now.getFullYear(), now.getMonth() - 5, 1)

      // Fetch all data in parallel
      const [
        accountsRes,
        transactionsRes,
        monthlyTransactionsRes,
        budgetsRes,
        trendRes,
      ] = await Promise.all([
        // All accounts
        supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true),
        // Recent transactions (last 10)
        supabase
          .from('transactions')
          .select(`
            *,
            account:accounts!account_id(*),
            category:categories(*),
            to_account:accounts!to_account_id(*)
          `)
          .eq('user_id', user.id)
          .order('transaction_date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(10),
        // This month's transactions for summary
        supabase
          .from('transactions')
          .select(`
            *,
            category:categories(*)
          `)
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('transaction_date', startOfMonth.toISOString().split('T')[0])
          .lte('transaction_date', endOfMonth.toISOString().split('T')[0]),
        // Budgets with categories
        supabase
          .from('budgets')
          .select(`
            *,
            category:categories(*)
          `)
          .eq('user_id', user.id),
        // Last 6 months trend (single query instead of 6)
        supabase
          .from('transactions')
          .select('type, amount, transaction_date, status')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('transaction_date', trendStart.toISOString().split('T')[0])
          .lte('transaction_date', endOfMonth.toISOString().split('T')[0]),
      ])

      if (accountsRes.error) throw accountsRes.error
      if (transactionsRes.error) throw transactionsRes.error
      if (monthlyTransactionsRes.error) throw monthlyTransactionsRes.error
      if (budgetsRes.error) throw budgetsRes.error
      if (trendRes.error) throw trendRes.error

      const accounts = accountsRes.data || []
      const recentTransactions = transactionsRes.data || []
      const monthlyTransactions = monthlyTransactionsRes.data || []
      const budgets = budgetsRes.data || []
      const trendTransactions = trendRes.data || []

      // Calculate totals
      const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
      const monthlyIncome = monthlyTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      const monthlyExpense = monthlyTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      const monthlySavings = monthlyIncome - monthlyExpense

      // Calculate category spending for this month
      const categoryMap = new Map<string, { name: string; amount: number; color: string }>()
      monthlyTransactions
        .filter((t) => t.type === 'expense' && t.category)
        .forEach((t) => {
          const cat = t.category
          if (!cat) return
          const existing = categoryMap.get(cat.id) || {
            name: cat.name,
            amount: 0,
            color: cat.color || '#6b7280',
          }
          existing.amount += t.amount
          categoryMap.set(cat.id, existing)
        })
      const categorySpending = Array.from(categoryMap.values())
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6)

      // Calculate budget alerts (over 80% spent)
      const budgetAlerts: BudgetWithCategory[] = []
      for (const budget of budgets) {
        const spent = monthlyTransactions
          .filter((t) => t.type === 'expense' && t.category_id === budget.category_id)
          .reduce((sum, t) => sum + t.amount, 0)
        if (spent / budget.amount >= budget.alert_threshold / 100) {
          budgetAlerts.push({ ...budget, spent })
        }
      }

      // Build 6-month trend from single query result
      const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
      const monthlyTrend: MonthlyData[] = []
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
        const startStr = monthDate.toISOString().split('T')[0]
        const endStr = monthEnd.toISOString().split('T')[0]

        const monthTransactions = trendTransactions.filter((t) => {
          return t.transaction_date >= startStr && t.transaction_date <= endStr
        })

        const income = monthTransactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)
        const expense = monthTransactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)

        monthlyTrend.push({
          month: monthNames[monthDate.getMonth()],
          income,
          expense,
        })
      }

      setData({
        totalBalance,
        monthlyIncome,
        monthlyExpense,
        monthlySavings,
        recentTransactions,
        budgetAlerts,
        monthlyTrend,
        categorySpending,
        accounts,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return {
    ...data,
    isLoading,
    error,
    refetch: fetchDashboardData,
  }
}
