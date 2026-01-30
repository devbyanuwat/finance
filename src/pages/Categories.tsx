import { useState } from 'react'
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'
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
import { CategoryList, CategoryForm } from '@/components/categories'
import { useCategories } from '@/hooks/useCategories'
import type { Category } from '@/types/database.types'
import type { CategoryFormData } from '@/lib/validations'

export default function Categories() {
  const {
    incomeCategories,
    expenseCategories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [defaultType, setDefaultType] = useState<'income' | 'expense'>('expense')

  const handleCreate = (type: 'income' | 'expense') => {
    setSelectedCategory(null)
    setDefaultType(type)
    setIsFormOpen(true)
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setIsFormOpen(true)
  }

  const handleDelete = (category: Category) => {
    setSelectedCategory(category)
    setIsDeleteOpen(true)
  }

  const handleSubmit = async (data: CategoryFormData) => {
    try {
      const categoryData = {
        ...data,
        icon: data.icon ?? null,
        color: data.color ?? null,
        parent_id: data.parent_id ?? null,
      }
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, categoryData)
        toast.success('แก้ไขหมวดหมู่สำเร็จ')
      } else {
        await createCategory(categoryData)
        toast.success('เพิ่มหมวดหมู่สำเร็จ')
      }
      setIsFormOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด')
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedCategory) return

    try {
      await deleteCategory(selectedCategory.id)
      toast.success('ลบหมวดหมู่สำเร็จ')
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
          <h1 className="text-3xl font-bold">หมวดหมู่</h1>
          <Button onClick={() => handleCreate(defaultType)}>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มหมวดหมู่
          </Button>
        </div>

        {/* Summary Cards */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">หมวดหมู่รายจ่าย</CardTitle>
                <TrendingDown className="h-4 w-4 text-expense" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{expenseCategories.length}</div>
                <p className="text-xs text-muted-foreground">หมวดหมู่</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">หมวดหมู่รายได้</CardTitle>
                <TrendingUp className="h-4 w-4 text-income" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{incomeCategories.length}</div>
                <p className="text-xs text-muted-foreground">หมวดหมู่</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="expense" onValueChange={(v) => setDefaultType(v as 'income' | 'expense')} className="space-y-4">
          <TabsList>
            <TabsTrigger value="expense" className="text-expense">
              รายจ่าย ({expenseCategories.length})
            </TabsTrigger>
            <TabsTrigger value="income" className="text-income">
              รายได้ ({incomeCategories.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expense" className="space-y-4">
            <CategoryList
              categories={expenseCategories}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </TabsContent>

          <TabsContent value="income" className="space-y-4">
            <CategoryList
              categories={incomeCategories}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </TabsContent>
        </Tabs>

        {/* Create/Edit Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={selectedCategory || { type: defaultType } as Category}
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
                คุณต้องการลบหมวดหมู่ "{selectedCategory?.name}" ใช่หรือไม่?
                รายการที่ใช้หมวดหมู่นี้จะไม่มีหมวดหมู่
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
