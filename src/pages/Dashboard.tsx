import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">
          สวัสดี, {user?.user_metadata?.full_name || 'ผู้ใช้'}!
        </h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Net Worth Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                มูลค่าสุทธิ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">฿0.00</div>
              <p className="text-xs text-muted-foreground">
                สินทรัพย์ - หนี้สิน
              </p>
            </CardContent>
          </Card>

          {/* Income Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                รายได้เดือนนี้
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-income">฿0.00</div>
              <p className="text-xs text-muted-foreground">
                ยังไม่มีรายการ
              </p>
            </CardContent>
          </Card>

          {/* Expense Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                รายจ่ายเดือนนี้
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-expense">฿0.00</div>
              <p className="text-xs text-muted-foreground">
                ยังไม่มีรายการ
              </p>
            </CardContent>
          </Card>

          {/* Savings Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                เงินออมเดือนนี้
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-investment">฿0.00</div>
              <p className="text-xs text-muted-foreground">
                รายได้ - รายจ่าย
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Section */}
        <Card>
          <CardHeader>
            <CardTitle>เร็วๆ นี้</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              ฟีเจอร์เพิ่มเติมกำลังมา... รวมถึงการจัดการบัญชี, บันทึกรายรับ-รายจ่าย,
              งบประมาณ, เป้าหมายการออม, และอีกมากมาย!
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
