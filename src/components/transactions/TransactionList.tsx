import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Receipt } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { TransactionCard } from './TransactionCard'
import type { TransactionWithRelations } from '@/types/database.types'

interface TransactionListProps {
  transactions: TransactionWithRelations[]
  isLoading: boolean
  onEdit: (transaction: TransactionWithRelations) => void
  onDelete: (transaction: TransactionWithRelations) => void
}

export function TransactionList({
  transactions,
  isLoading,
  onEdit,
  onDelete,
}: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
        <Receipt className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">ยังไม่มีรายการ</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          เริ่มต้นโดยการเพิ่มรายการแรกของคุณ
        </p>
      </div>
    )
  }

  // Group transactions by date
  const groupedTransactions = transactions.reduce(
    (groups, transaction) => {
      const date = transaction.transaction_date
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(transaction)
      return groups
    },
    {} as Record<string, TransactionWithRelations[]>
  )

  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => (
        <div key={date}>
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">
            {format(new Date(date), 'EEEE d MMMM yyyy', { locale: th })}
          </h3>
          <div className="space-y-2">
            {groupedTransactions[date].map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
