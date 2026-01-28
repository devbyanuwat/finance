import { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react'
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
import {
  TransactionForm,
  TransactionList,
  TransactionFilter,
} from '@/components/transactions'
import { formatCurrency } from '@/components/accounts'
import { useTransactions, type TransactionFilters } from '@/hooks/useTransactions'
import type { Transaction, TransactionWithRelations } from '@/types/database.types'
import type { TransactionFormData } from '@/lib/validations'

export default function Transactions() {
  const [filters, setFilters] = useState<TransactionFilters>({})
  const {
    transactions,
    isLoading,
    totalIncome,
    totalExpense,
    netAmount,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions(filters)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionWithRelations | null>(null)

  const handleCreate = () => {
    setSelectedTransaction(null)
    setIsFormOpen(true)
  }

  const handleEdit = (transaction: TransactionWithRelations) => {
    setSelectedTransaction(transaction)
    setIsFormOpen(true)
  }

  const handleDelete = (transaction: TransactionWithRelations) => {
    setSelectedTransaction(transaction)
    setIsDeleteOpen(true)
  }

  const handleSubmit = async (data: TransactionFormData) => {
    try {
      const transactionData = {
        ...data,
        transaction_date: data.transaction_date.toISOString().split('T')[0],
        to_account_id: data.to_account_id ?? null,
        category_id: data.category_id ?? null,
        description: data.description ?? null,
        note: data.note ?? null,
        tags: data.tags ?? null,
        is_recurring: false,
        recurring_rule: null,
        receipt_url: null,
      }

      if (selectedTransaction) {
        await updateTransaction(
          selectedTransaction.id,
          selectedTransaction as Transaction,
          transactionData
        )
        toast.success('แก้ไขรายการสำเร็จ')
      } else {
        await createTransaction(transactionData)
        toast.success('เพิ่มรายการสำเร็จ')
      }
      setIsFormOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด')
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedTransaction) return

    try {
      await deleteTransaction(selectedTransaction as Transaction)
      toast.success('ลบรายการสำเร็จ')
      setIsDeleteOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด')
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">รายการ</h1>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มรายการ
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายได้</CardTitle>
              <TrendingUp className="h-4 w-4 text-income" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-income">
                {formatCurrency(totalIncome)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายจ่าย</CardTitle>
              <TrendingDown className="h-4 w-4 text-expense" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-expense">
                {formatCurrency(totalExpense)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">คงเหลือ</CardTitle>
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${netAmount >= 0 ? 'text-income' : 'text-expense'}`}
              >
                {formatCurrency(netAmount)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <TransactionFilter filters={filters} onFiltersChange={setFilters} />

        {/* Transaction List */}
        <TransactionList
          transactions={transactions}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Create/Edit Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedTransaction ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}
              </DialogTitle>
            </DialogHeader>
            <TransactionForm
              transaction={selectedTransaction}
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
                คุณต้องการลบรายการนี้ใช่หรือไม่?
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
