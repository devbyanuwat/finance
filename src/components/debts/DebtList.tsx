import { CreditCard } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { DebtCard } from './DebtCard'
import type { DebtWithRelations } from '@/types/database.types'

interface DebtListProps {
  debts: DebtWithRelations[]
  isLoading: boolean
  onEdit: (debt: DebtWithRelations) => void
  onDelete: (debt: DebtWithRelations) => void
  onConvert: (debt: DebtWithRelations) => void
}

export function DebtList({ debts, isLoading, onEdit, onDelete, onConvert }: DebtListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-56" />
        ))}
      </div>
    )
  }

  if (debts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">ยังไม่มีรายการหนี้สิน</p>
        <p className="text-sm text-muted-foreground mt-1">
          เพิ่มรายการหนี้สินเพื่อติดตามการผ่อนชำระ
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {debts.map((debt) => (
        <DebtCard
          key={debt.id}
          debt={debt}
          onEdit={onEdit}
          onDelete={onDelete}
          onConvert={onConvert}
        />
      ))}
    </div>
  )
}
