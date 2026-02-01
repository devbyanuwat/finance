import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from './useSupabase'
import { useAuth } from './useAuth'
import type { Account } from '@/types/database.types'

export type ReportPeriod = 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'this_year'

interface MonthlyComparison {
  month: string
  income: number
  expense: number
}

interface CategoryBreakdown {
  name: string
  amount: number
  percentage: number
  color: string
}

interface ReportData {
  totalIncome: number
  totalExpense: number
  netAmount: number
  monthlyComparison: MonthlyComparison[]
  incomeByCategory: CategoryBreakdown[]
  expenseByCategory: CategoryBreakdown[]
  accounts: Account[]
  totalBalance: number
  transactionCount: number
}

const initialData: ReportData = {
  totalIncome: 0,
  totalExpense: 0,
  netAmount: 0,
  monthlyComparison: [],
  incomeByCategory: [],
  expenseByCategory: [],
  accounts: [],
  totalBalance: 0,
  transactionCount: 0,
}

const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

function getDateRange(period: ReportPeriod): { startDate: string; endDate: string } {
  const now = new Date()
  let start: Date
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  switch (period) {
    case 'this_month':
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'last_month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0],
      }
    case 'last_3_months':
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      break
    case 'last_6_months':
      start = new Date(now.getFullYear(), now.getMonth() - 5, 1)
      break
    case 'this_year':
      start = new Date(now.getFullYear(), 0, 1)
      break
  }

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }
}

function getMonthsBetween(startDate: string, endDate: string): { year: number; month: number }[] {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const months: { year: number; month: number }[] = []

  const current = new Date(start.getFullYear(), start.getMonth(), 1)
  while (current <= end) {
    months.push({ year: current.getFullYear(), month: current.getMonth() })
    current.setMonth(current.getMonth() + 1)
  }
  return months
}

export function useReports(period: ReportPeriod) {
  const { user } = useAuth()
  const supabase = useSupabase()
  const [data, setData] = useState<ReportData>(initialData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReportData = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      const { startDate, endDate } = getDateRange(period)

      const [transactionsRes, accountsRes] = await Promise.all([
        supabase
          .from('transactions')
          .select(`
            *,
            category:categories(*)
          `)
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('transaction_date', startDate)
          .lte('transaction_date', endDate),
        supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true),
      ])

      if (transactionsRes.error) throw transactionsRes.error
      if (accountsRes.error) throw accountsRes.error

      const transactions = transactionsRes.data || []
      const accounts = accountsRes.data || []

      // Calculate totals
      const totalIncome = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      const totalExpense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      const netAmount = totalIncome - totalExpense

      // Monthly comparison
      const months = getMonthsBetween(startDate, endDate)
      const monthlyComparison: MonthlyComparison[] = months.map(({ year, month }) => {
        const monthStart = new Date(year, month, 1).toISOString().split('T')[0]
        const monthEnd = new Date(year, month + 1, 0).toISOString().split('T')[0]

        const monthTransactions = transactions.filter(
          (t) => t.transaction_date >= monthStart && t.transaction_date <= monthEnd
        )

        return {
          month: monthNames[month],
          income: monthTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0),
          expense: monthTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0),
        }
      })

      // Category breakdowns
      const expenseCategoryMap = new Map<string, { name: string; amount: number; color: string }>()
      const incomeCategoryMap = new Map<string, { name: string; amount: number; color: string }>()

      transactions.forEach((t) => {
        if (!t.category) return
        const map = t.type === 'expense' ? expenseCategoryMap : t.type === 'income' ? incomeCategoryMap : null
        if (!map) return

        const existing = map.get(t.category.id) || {
          name: t.category.name,
          amount: 0,
          color: t.category.color || '#6b7280',
        }
        existing.amount += t.amount
        map.set(t.category.id, existing)
      })

      const buildBreakdown = (map: Map<string, { name: string; amount: number; color: string }>): CategoryBreakdown[] => {
        const total = Array.from(map.values()).reduce((sum, c) => sum + c.amount, 0)
        return Array.from(map.values())
          .sort((a, b) => b.amount - a.amount)
          .map((c) => ({
            ...c,
            percentage: total > 0 ? (c.amount / total) * 100 : 0,
          }))
      }

      const expenseByCategory = buildBreakdown(expenseCategoryMap)
      const incomeByCategory = buildBreakdown(incomeCategoryMap)

      // Account balances
      const totalBalance = accounts.reduce((sum, acc) => {
        if (acc.type === 'credit_card') return sum - acc.balance
        return sum + acc.balance
      }, 0)

      setData({
        totalIncome,
        totalExpense,
        netAmount,
        monthlyComparison,
        incomeByCategory,
        expenseByCategory,
        accounts,
        totalBalance,
        transactionCount: transactions.length,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase, period])

  useEffect(() => {
    fetchReportData()
  }, [fetchReportData])

  return {
    ...data,
    isLoading,
    error,
    refetch: fetchReportData,
  }
}
