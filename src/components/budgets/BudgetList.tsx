import { BudgetCard } from './BudgetCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { BudgetWithCategory } from '@/types/database.types'

interface BudgetListProps {
  budgets: BudgetWithCategory[]
  isLoading: boolean
  onEdit: (budget: BudgetWithCategory) => void
  onDelete: (budget: BudgetWithCategory) => void
}

export function BudgetList({
  budgets,
  isLoading,
  onEdit,
  onDelete,
}: BudgetListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    )
  }

  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium">ยังไม่มีงบประมาณ</p>
        <p className="text-muted-foreground">
          สร้างงบประมาณเพื่อติดตามการใช้จ่ายในแต่ละหมวดหมู่
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {budgets.map((budget) => (
        <BudgetCard
          key={budget.id}
          budget={budget}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
