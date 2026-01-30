import { useState } from 'react'
import { Plus, PiggyBank, AlertTriangle, Target } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { BudgetForm, BudgetList } from '@/components/budgets'
import { formatCurrency } from '@/lib/utils'
import { useBudgets } from '@/hooks/useBudgets'
import type { BudgetWithCategory } from '@/types/database.types'
import type { BudgetFormData } from '@/lib/validations'

export default function Budgets() {
  const {
    budgets,
    isLoading,
    totalBudget,
    totalSpent,
    budgetsOverThreshold,
    createBudget,
    updateBudget,
    deleteBudget,
  } = useBudgets()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<BudgetWithCategory | null>(null)

  const handleCreate = () => {
    setSelectedBudget(null)
    setIsFormOpen(true)
  }

  const handleEdit = (budget: BudgetWithCategory) => {
    setSelectedBudget(budget)
    setIsFormOpen(true)
  }

  const handleDelete = (budget: BudgetWithCategory) => {
    setSelectedBudget(budget)
    setIsDeleteOpen(true)
  }

  const handleSubmit = async (data: BudgetFormData) => {
    try {
      const budgetData = {
        ...data,
        start_date: data.start_date ? data.start_date.toISOString().split('T')[0] : null,
      }

      if (selectedBudget) {
        await updateBudget(selectedBudget.id, budgetData)
        toast.success('แก้ไขงบประมาณสำเร็จ')
      } else {
        await createBudget(budgetData)
        toast.success('สร้างงบประมาณสำเร็จ')
      }
      setIsFormOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด')
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedBudget) return

    try {
      await deleteBudget(selectedBudget.id)
      toast.success('ลบงบประมาณสำเร็จ')
      setIsDeleteOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด')
    }
  }

  const remainingBudget = totalBudget - totalSpent
  const usagePercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">งบประมาณ</h1>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            สร้างงบประมาณ
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">งบประมาณทั้งหมด</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{formatCurrency(totalBudget)}</div>
              <p className="text-xs text-muted-foreground">
                {budgets.length} หมวดหมู่
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ใช้ไปแล้ว</CardTitle>
              <PiggyBank className="h-4 w-4 text-expense" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-expense tabular-nums">
                {formatCurrency(totalSpent)}
              </div>
              <p className="text-xs text-muted-foreground">
                {usagePercentage.toFixed(1)}% ของงบทั้งหมด
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">แจ้งเตือน</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {budgetsOverThreshold}
              </div>
              <p className="text-xs text-muted-foreground">
                หมวดหมู่ที่ใกล้ถึงขีดจำกัด
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress */}
        {totalBudget > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ภาพรวมการใช้งบประมาณ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>ใช้ไป {formatCurrency(totalSpent)}</span>
                  <span>คงเหลือ {formatCurrency(Math.max(remainingBudget, 0))}</span>
                </div>
                <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full transition-[width] ${
                      usagePercentage > 100
                        ? 'bg-destructive'
                        : usagePercentage > 80
                          ? 'bg-yellow-500'
                          : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Budget List */}
        <BudgetList
          budgets={budgets}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Create/Edit Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedBudget ? 'แก้ไขงบประมาณ' : 'สร้างงบประมาณใหม่'}
              </DialogTitle>
            </DialogHeader>
            <BudgetForm
              budget={selectedBudget}
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
                คุณต้องการลบงบประมาณสำหรับหมวดหมู่ &quot;{selectedBudget?.category?.name}&quot; ใช่หรือไม่?
                การดำเนินการนี้ไม่สามารถยกเลิกได้
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
      </div>
    </DashboardLayout>
  )
}
