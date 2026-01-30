import { Link } from 'react-router-dom'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useAuth } from '@/hooks/useAuth'
import { useDashboard } from '@/hooks/useDashboard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout'
import { formatCurrency } from '@/components/accounts'
import { CategoryIcon } from '@/components/categories'
import { BudgetProgress } from '@/components/budgets'

export default function Dashboard() {
  const { user } = useAuth()
  const {
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    monthlySavings,
    recentTransactions,
    budgetAlerts,
    monthlyTrend,
    categorySpending,
    accounts,
    isLoading,
  } = useDashboard()

  const formatChartValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value.toString()
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              สวัสดี, {user?.user_metadata?.full_name || 'ผู้ใช้'}!
            </h1>
            <p className="text-muted-foreground">
              ภาพรวมการเงินของคุณในเดือนนี้
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ยอดรวมทั้งหมด</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{formatCurrency(totalBalance)}</div>
              <p className="text-xs text-muted-foreground">
                จาก {accounts.length} บัญชี
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายได้เดือนนี้</CardTitle>
              <TrendingUp className="h-4 w-4 text-income" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-income tabular-nums">
                {formatCurrency(monthlyIncome)}
              </div>
              <p className="text-xs text-muted-foreground">
                +{recentTransactions.filter((t) => t.type === 'income').length} รายการ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายจ่ายเดือนนี้</CardTitle>
              <TrendingDown className="h-4 w-4 text-expense" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-expense tabular-nums">
                {formatCurrency(monthlyExpense)}
              </div>
              <p className="text-xs text-muted-foreground">
                {recentTransactions.filter((t) => t.type === 'expense').length} รายการ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เงินออมเดือนนี้</CardTitle>
              <PiggyBank className="h-4 w-4 text-investment" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold tabular-nums ${
                  monthlySavings >= 0 ? 'text-income' : 'text-expense'
                }`}
              >
                {formatCurrency(monthlySavings)}
              </div>
              <p className="text-xs text-muted-foreground">รายได้ - รายจ่าย</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Monthly Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>แนวโน้มรายรับ-รายจ่าย</CardTitle>
              <CardDescription>6 เดือนย้อนหลัง</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis tickFormatter={formatChartValue} className="text-xs" />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar
                      dataKey="income"
                      name="รายได้"
                      fill="hsl(var(--income))"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="expense"
                      name="รายจ่าย"
                      fill="hsl(var(--expense))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Spending Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>สัดส่วนรายจ่ายตามหมวดหมู่</CardTitle>
              <CardDescription>เดือนนี้</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {categorySpending.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorySpending}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="amount"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {categorySpending.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    ยังไม่มีข้อมูลรายจ่าย
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Alerts & Recent Transactions */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Budget Alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  แจ้งเตือนงบประมาณ
                </CardTitle>
                <CardDescription>หมวดหมู่ที่ใกล้ถึงขีดจำกัด</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/budgets">
                  ดูทั้งหมด <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {budgetAlerts.length > 0 ? (
                <div className="space-y-4">
                  {budgetAlerts.slice(0, 3).map((budget) => (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {budget.category && (
                            <CategoryIcon
                              name={budget.category.icon}
                              color={budget.category.color}
                            />
                          )}
                          <span className="font-medium">
                            {budget.category?.name}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(budget.spent || 0)} / {formatCurrency(budget.amount)}
                        </span>
                      </div>
                      <BudgetProgress
                        spent={budget.spent || 0}
                        budget={budget.amount}
                        alertThreshold={budget.alert_threshold}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  ไม่มีงบประมาณที่ใกล้ถึงขีดจำกัด
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>รายการล่าสุด</CardTitle>
                <CardDescription>10 รายการล่าสุด</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/transactions">
                  ดูทั้งหมด <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {transaction.category && (
                          <CategoryIcon
                            name={transaction.category.icon}
                            color={transaction.category.color}
                          />
                        )}
                        <div>
                          <p className="font-medium text-sm">
                            {transaction.description ||
                              transaction.category?.name ||
                              (transaction.type === 'transfer'
                                ? 'โอนเงิน'
                                : 'รายการ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.account?.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            transaction.type === 'income'
                              ? 'text-income'
                              : transaction.type === 'expense'
                                ? 'text-expense'
                                : ''
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {transaction.type === 'income'
                            ? 'รายได้'
                            : transaction.type === 'expense'
                              ? 'รายจ่าย'
                              : 'โอน'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  ยังไม่มีรายการ
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>ทางลัด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link to="/transactions">+ เพิ่มรายการ</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/accounts">จัดการบัญชี</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/budgets">ดูงบประมาณ</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/categories">จัดการหมวดหมู่</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
