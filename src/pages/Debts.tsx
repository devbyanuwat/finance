import { useState } from 'react'
import { Plus, Landmark, CalendarClock, BadgeDollarSign, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { DebtForm, DebtList, ConvertInstallmentDialog } from '@/components/debts'
import { formatCurrency } from '@/lib/utils'
import { useDebts } from '@/hooks/useDebts'
import type { DebtWithRelations } from '@/types/database.types'
import type { DebtFormData } from '@/lib/validations'

export default function Debts() {
  const {
    debts,
    isLoading,
    error,
    totalDebt,
    monthlyObligation,
    upcomingPayments,
    createDebt,
    updateDebt,
    cancelDebt,
    deleteDebt,
    convertToInstallment,
    fetchDebts,
  } = useDebts()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isConvertOpen, setIsConvertOpen] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<DebtWithRelations | null>(null)

  const handleCreate = () => {
    setSelectedDebt(null)
    setIsFormOpen(true)
  }

  const handleEdit = (debt: DebtWithRelations) => {
    setSelectedDebt(debt)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (debt: DebtWithRelations) => {
    setSelectedDebt(debt)
    setIsDeleteOpen(true)
  }

  const handleConvertClick = (debt: DebtWithRelations) => {
    setSelectedDebt(debt)
    setIsConvertOpen(true)
  }

  const handleSubmit = async (data: DebtFormData) => {
    try {
      const debtData = {
        name: data.name,
        debt_type: data.debt_type,
        total_amount: data.total_amount,
        installment_count: data.installment_count,
        interest_rate: data.interest_rate,
        creditor_name: data.creditor_name || null,
        account_id: data.account_id || null,
        category_id: data.category_id || null,
        due_day: data.due_day || null,
        start_date: data.start_date.toISOString().split('T')[0],
        note: data.note || null,
      }

      if (selectedDebt) {
        await updateDebt(selectedDebt.id, debtData)
        toast.success('แก้ไขรายการหนี้สำเร็จ')
      } else {
        await createDebt(debtData)
        toast.success('เพิ่มรายการหนี้สำเร็จ')
      }
      setIsFormOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedDebt) return
    try {
      await deleteDebt(selectedDebt.id)
      toast.success('ลบรายการหนี้สำเร็จ')
      setIsDeleteOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    }
  }

  const handleConvertConfirm = async (debtId: string, count: number, rate: number) => {
    try {
      await convertToInstallment(debtId, count, rate)
      toast.success('แปลงเป็นผ่อนชำระสำเร็จ')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    }
  }

  // Filter debts by tab
  const activeDebts = debts.filter((d) => d.status === 'active')
  const completedDebts = debts.filter((d) => d.status === 'completed')

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-56" />
            <Skeleton className="h-56" />
            <Skeleton className="h-56" />
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
          <Button onClick={fetchDebts} variant="outline">ลองใหม่</Button>
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
            <h1 className="text-2xl font-bold">หนี้สิน & ผ่อนชำระ</h1>
            <p className="text-sm text-muted-foreground">
              ติดตามหนี้สิน ผ่อนชำระ และเงินกู้ยืม
            </p>
          </div>
          <Button onClick={handleCreate} className="rounded-full">
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มรายการหนี้
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Landmark className="h-4 w-4 text-debt" />
                หนี้คงค้างทั้งหมด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-debt tabular-nums">
                {formatCurrency(totalDebt)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeDebts.length} รายการ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BadgeDollarSign className="h-4 w-4 text-expense" />
                ยอดชำระรายเดือน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-expense tabular-nums">
                {formatCurrency(monthlyObligation)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                รวมทุกรายการที่กำลังชำระ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-yellow-500" />
                ครบกำหนดเร็วๆ นี้
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">
                {upcomingPayments.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                รายการภายใน 30 วัน
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">ทั้งหมด ({debts.length})</TabsTrigger>
            <TabsTrigger value="active">กำลังชำระ ({activeDebts.length})</TabsTrigger>
            <TabsTrigger value="completed">ชำระครบแล้ว ({completedDebts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <DebtList
              debts={debts}
              isLoading={false}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onConvert={handleConvertClick}
            />
          </TabsContent>

          <TabsContent value="active" className="mt-4">
            <DebtList
              debts={activeDebts}
              isLoading={false}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onConvert={handleConvertClick}
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            <DebtList
              debts={completedDebts}
              isLoading={false}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onConvert={handleConvertClick}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedDebt ? 'แก้ไขรายการหนี้' : 'เพิ่มรายการหนี้'}
            </DialogTitle>
          </DialogHeader>
          <DebtForm
            debt={selectedDebt}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบรายการหนี้ &quot;{selectedDebt?.name}&quot; ใช่หรือไม่?
              รายการผ่อนชำระที่รอชำระจะถูกลบด้วย
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Convert to Installment Dialog */}
      <ConvertInstallmentDialog
        debt={selectedDebt}
        open={isConvertOpen}
        onOpenChange={setIsConvertOpen}
        onConfirm={handleConvertConfirm}
      />
    </DashboardLayout>
  )
}
