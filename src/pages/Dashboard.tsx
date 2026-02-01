import { Link } from 'react-router-dom'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  AlertTriangle,
  ArrowRight,
  Plus,
} from 'lucide-react'
import {
  AreaChart,
  Area,
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
    error,
    refetch,
  } = useDashboard()

  const formatChartValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value.toString()
  }

  const hasNoData = accounts.length === 0 && recentTransactions.length === 0

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="col-span-2 h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-lg font-semibold">ไม่สามารถโหลดข้อมูลได้</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">{error}</p>
          <Button onClick={refetch} variant="outline">
            ลองใหม่
          </Button>
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
            <h1 className="text-2xl font-bold">
              สวัสดี, {user?.user_metadata?.full_name || 'ผู้ใช้'}!
            </h1>
            <p className="text-sm text-muted-foreground">
              ภาพรวมการเงินของคุณในเดือนนี้
            </p>
          </div>
          <Button asChild className="rounded-full">
            <Link to="/transactions">
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มรายการ
            </Link>
          </Button>
        </div>

        {/* Onboarding state for new users */}
        {hasNoData && (
          <Card>
            <CardContent className="flex flex-col items-center text-center py-12">
              <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold">เริ่มต้นใช้งาน</h2>
              <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-md">
                เพิ่มบัญชีและรายการแรกของคุณเพื่อเริ่มติดตามการเงิน
              </p>
              <div className="flex gap-3">
                <Button asChild>
                  <Link to="/accounts">เพิ่มบัญชี</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/transactions">เพิ่มรายการ</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Row 1: Balance + Stats + Accounts */}
        {!hasNoData && <div className="grid gap-4 md:grid-cols-3">
          {/* Balance Card (dark bg) */}
          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary-foreground/80">
                ยอดรวมทั้งหมด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tabular-nums">
                {formatCurrency(totalBalance)}
              </div>
              <p className="mt-1 text-sm text-primary-foreground/70">
                จาก {accounts.length} บัญชี
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  asChild
                  className="rounded-full text-xs"
                >
                  <Link to="/transactions">ดูรายการ</Link>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  asChild
                  className="rounded-full text-xs"
                >
                  <Link to="/accounts">ดูบัญชี</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Income / Expense / Savings stacked */}
          <Card>
            <CardContent className="flex h-full flex-col justify-center divide-y p-5">
              <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-income" />
                  <span className="text-sm text-muted-foreground">รายได้</span>
                </div>
                <span className="font-bold text-income tabular-nums">
                  {formatCurrency(monthlyIncome)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-expense" />
                  <span className="text-sm text-muted-foreground">รายจ่าย</span>
                </div>
                <span className="font-bold text-expense tabular-nums">
                  {formatCurrency(monthlyExpense)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 text-investment" />
                  <span className="text-sm text-muted-foreground">เงินออม</span>
                </div>
                <span
                  className={`font-bold tabular-nums ${
                    monthlySavings >= 0 ? 'text-income' : 'text-expense'
                  }`}
                >
                  {formatCurrency(monthlySavings)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Accounts overview */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">บัญชีของฉัน</CardTitle>
                <Button variant="ghost" size="sm" asChild className="text-xs">
                  <Link to="/accounts">
                    ดูทั้งหมด <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {accounts.slice(0, 3).map((account) => (
                  <div key={account.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{account.name}</span>
                    </div>
                    <span className="text-sm font-medium tabular-nums">
                      {formatCurrency(account.balance)}
                    </span>
                  </div>
                ))}
                {accounts.length === 0 && (
                  <p className="text-sm text-muted-foreground">ยังไม่มีบัญชี</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>}

        {/* Row 2: AreaChart (2/3) + PieChart (1/3) */}
        {!hasNoData && <div className="grid gap-4 md:grid-cols-3">
          {/* Monthly Trend AreaChart */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>แนวโน้มรายรับ-รายจ่าย</CardTitle>
              <CardDescription>6 เดือนย้อนหลัง</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend}>
                    <defs>
                      <linearGradient id="gradientIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--income))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--income))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradientExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--expense))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--expense))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={formatChartValue} className="text-xs" axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      name="รายได้"
                      stroke="hsl(var(--income))"
                      strokeWidth={2.5}
                      fill="url(#gradientIncome)"
                      dot={{ fill: '#fff', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      name="รายจ่าย"
                      stroke="hsl(var(--expense))"
                      strokeWidth={2.5}
                      fill="url(#gradientExpense)"
                      dot={{ fill: '#fff', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Spending Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>สัดส่วนรายจ่าย</CardTitle>
              <CardDescription>เดือนนี้</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
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
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)',
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
        </div>}

        {/* Row 3: Budget Alerts + Recent Transactions */}
        {!hasNoData && <div className="grid gap-4 md:grid-cols-2">
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
        </div>}
      </div>
    </DashboardLayout>
  )
}
