import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Wallet,
  BarChart3,
  FileText,
  Landmark,
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
  Legend,
} from 'recharts'
import { useReports, type ReportPeriod } from '@/hooks/useReports'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardLayout } from '@/components/layout'
import { formatCurrency } from '@/lib/utils'

const periodOptions: { value: ReportPeriod; label: string }[] = [
  { value: 'this_month', label: 'เดือนนี้' },
  { value: 'last_month', label: 'เดือนก่อน' },
  { value: 'last_3_months', label: '3 เดือนย้อนหลัง' },
  { value: 'last_6_months', label: '6 เดือนย้อนหลัง' },
  { value: 'this_year', label: 'ปีนี้' },
]

const accountTypeLabels: Record<string, string> = {
  cash: 'เงินสด',
  bank: 'บัญชีธนาคาร',
  credit_card: 'บัตรเครดิต',
  e_wallet: 'E-Wallet',
}

const formatChartValue = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
  return value.toString()
}

const tooltipStyle = {
  backgroundColor: 'hsl(var(--background))',
  border: 'none',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)',
}

export default function Reports() {
  const [period, setPeriod] = useState<ReportPeriod>('this_month')
  const {
    totalIncome,
    totalExpense,
    netAmount,
    monthlyComparison,
    expenseByCategory,
    incomeByCategory,
    accounts,
    totalBalance,
    transactionCount,
    debtSummary,
    isLoading,
    error,
    refetch,
  } = useReports(period)

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-48" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-80" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-80" />
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

  const hasData = transactionCount > 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">รายงาน</h1>
            <p className="text-sm text-muted-foreground">
              สรุปข้อมูลทางการเงินของคุณ
            </p>
          </div>
          <Select value={period} onValueChange={(v) => setPeriod(v as ReportPeriod)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-income" />
                รายได้
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-income tabular-nums">
                {formatCurrency(totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {incomeByCategory.length} หมวดหมู่
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-expense" />
                รายจ่าย
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-expense tabular-nums">
                {formatCurrency(totalExpense)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {expenseByCategory.length} หมวดหมู่
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                คงเหลือสุทธิ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold tabular-nums ${netAmount >= 0 ? 'text-income' : 'text-expense'}`}>
                {netAmount >= 0 ? '+' : ''}{formatCurrency(netAmount)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {transactionCount} รายการ
              </p>
            </CardContent>
          </Card>
        </div>

        {!hasData && (
          <Card>
            <CardContent className="flex flex-col items-center text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold">ไม่มีข้อมูลในช่วงเวลานี้</h2>
              <p className="text-sm text-muted-foreground mt-1">
                ลองเปลี่ยนช่วงเวลาเพื่อดูข้อมูลย้อนหลัง
              </p>
            </CardContent>
          </Card>
        )}

        {/* Monthly Bar Chart */}
        {hasData && monthlyComparison.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                เปรียบเทียบรายรับ-รายจ่ายรายเดือน
              </CardTitle>
              <CardDescription>
                {periodOptions.find((o) => o.value === period)?.label}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyComparison} barSize={20} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={formatChartValue} className="text-xs" axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      contentStyle={tooltipStyle}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      formatter={(value: string) => <span className="text-sm">{value}</span>}
                    />
                    <Bar dataKey="income" name="รายได้" fill="hsl(var(--income))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="รายจ่าย" fill="hsl(var(--expense))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Breakdown: Pie + Table */}
        {hasData && expenseByCategory.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>สัดส่วนรายจ่ายตามหมวดหมู่</CardTitle>
                <CardDescription>
                  {periodOptions.find((o) => o.value === period)?.label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="amount"
                        nameKey="name"
                        label={({ name, percentage }) =>
                          `${name} ${percentage.toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {expenseByCategory.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={tooltipStyle}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Table */}
            <Card>
              <CardHeader>
                <CardTitle>รายละเอียดรายจ่าย</CardTitle>
                <CardDescription>
                  เรียงตามจำนวนเงินมากที่สุด
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>หมวดหมู่</TableHead>
                      <TableHead className="text-right">จำนวน</TableHead>
                      <TableHead className="text-right">สัดส่วน</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenseByCategory.map((cat) => (
                      <TableRow key={cat.name}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full shrink-0"
                              style={{ backgroundColor: cat.color }}
                            />
                            {cat.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(cat.amount)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {cat.percentage.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="font-semibold">รวม</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatCurrency(totalExpense)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">100%</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Income by Category (if data exists) */}
        {hasData && incomeByCategory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>รายละเอียดรายรับ</CardTitle>
              <CardDescription>
                แยกตามหมวดหมู่
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>หมวดหมู่</TableHead>
                    <TableHead className="text-right">จำนวน</TableHead>
                    <TableHead className="text-right">สัดส่วน</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomeByCategory.map((cat) => (
                    <TableRow key={cat.name}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(cat.amount)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {cat.percentage.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-semibold">รวม</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatCurrency(totalIncome)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">100%</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Debt Summary */}
        {(debtSummary.activeCount > 0 || debtSummary.completedCount > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-debt" />
                สรุปหนี้สิน
              </CardTitle>
              <CardDescription>
                ภาพรวมหนี้สินทั้งหมด
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">หนี้คงค้าง</p>
                  <p className="text-xl font-bold text-debt tabular-nums">{formatCurrency(debtSummary.totalDebt)}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">ยอดชำระ/เดือน</p>
                  <p className="text-xl font-bold text-expense tabular-nums">{formatCurrency(debtSummary.monthlyObligation)}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">กำลังชำระ</p>
                  <p className="text-xl font-bold tabular-nums">{debtSummary.activeCount} รายการ</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">ชำระครบแล้ว</p>
                  <p className="text-xl font-bold text-income tabular-nums">{debtSummary.completedCount} รายการ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Balances */}
        {accounts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                ยอดเงินในบัญชี
              </CardTitle>
              <CardDescription>
                บัญชีที่ใช้งานอยู่ทั้งหมด
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>บัญชี</TableHead>
                    <TableHead>ประเภท</TableHead>
                    <TableHead className="text-right">ยอดเงิน</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {accountTypeLabels[account.type] || account.type}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(account.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2} className="font-semibold">ยอดรวมสุทธิ</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatCurrency(totalBalance)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
