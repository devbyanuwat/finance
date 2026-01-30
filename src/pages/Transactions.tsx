import { useState, useMemo, useEffect, useCallback } from 'react'
import { Plus, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { DashboardLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
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
import { formatCurrency } from '@/lib/utils'
import { useTransactions, type TransactionFilters } from '@/hooks/useTransactions'
import type { Transaction, TransactionWithRelations } from '@/types/database.types'
import type { TransactionFormData } from '@/lib/validations'

export default function Transactions() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Derive filters from URL search params
  const filters = useMemo<TransactionFilters>(() => ({
    type: (searchParams.get('type') as TransactionFilters['type']) || undefined,
    account_id: searchParams.get('account') || undefined,
    category_id: searchParams.get('category') || undefined,
    search: searchParams.get('q') || undefined,
  }), [searchParams])

  const currentPage = Number(searchParams.get('page')) || 1

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

  const itemsPerPage = 20

  // Calculate paginated transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return transactions.slice(startIndex, endIndex)
  }, [transactions, currentPage, itemsPerPage])

  const totalPages = Math.ceil(transactions.length / itemsPerPage)

  // Reset to page 1 when transactions change and current page is out of range
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setSearchParams((prev) => {
        prev.delete('page')
        return prev
      })
    }
  }, [transactions.length, currentPage, totalPages, setSearchParams])

  const setCurrentPage = useCallback((page: number) => {
    setSearchParams((prev) => {
      if (page <= 1) {
        prev.delete('page')
      } else {
        prev.set('page', String(page))
      }
      return prev
    })
  }, [setSearchParams])

  // Reset to page 1 when filters change
  const handleFilterChange = useCallback((newFilters: TransactionFilters) => {
    setSearchParams((prev) => {
      // Clear old filter params
      prev.delete('type')
      prev.delete('account')
      prev.delete('category')
      prev.delete('q')
      prev.delete('page')

      // Set new filter params
      if (newFilters.type) prev.set('type', newFilters.type)
      if (newFilters.account_id) prev.set('account', newFilters.account_id)
      if (newFilters.category_id) prev.set('category', newFilters.category_id)
      if (newFilters.search) prev.set('q', newFilters.search)

      return prev
    })
  }, [setSearchParams])

  const handleCreate = () => {
    setSelectedTransaction(null)
    setIsFormOpen(true)
  }

  const handleEdit = (transaction: TransactionWithRelations) => {
    setSelectedTransaction(transaction)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (transaction: TransactionWithRelations) => {
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
          <h1 className="text-2xl font-bold">รายการ</h1>
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
              <div className="text-2xl font-bold text-income tabular-nums">
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
              <div className="text-2xl font-bold text-expense tabular-nums">
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
                className={`text-2xl font-bold tabular-nums ${netAmount >= 0 ? 'text-income' : 'text-expense'}`}
              >
                {formatCurrency(netAmount)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <TransactionFilter filters={filters} onFilterChange={handleFilterChange} />

        {/* Transaction List */}
        <TransactionList
          transactions={paginatedTransactions}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />

        {/* Pagination */}
        {!isLoading && transactions.length > itemsPerPage && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  const showPage =
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)

                  if (!showPage) {
                    // Show ellipsis for gaps
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }
                    return null
                  }

                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <p className="text-sm text-muted-foreground">
              แสดง {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, transactions.length)} จาก {transactions.length} รายการ
            </p>
          </div>
        )}

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
