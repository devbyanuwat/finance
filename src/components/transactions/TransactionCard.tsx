import { ArrowRightLeft, Pencil, Trash2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CategoryIcon } from '@/components/categories'
import { formatCurrency } from '@/components/accounts'
import type { TransactionWithRelations } from '@/types/database.types'
import { cn } from '@/lib/utils'

interface TransactionCardProps {
  transaction: TransactionWithRelations
  onEdit: (transaction: TransactionWithRelations) => void
  onDelete: (transaction: TransactionWithRelations) => void
}

export function TransactionCard({
  transaction,
  onEdit,
  onDelete,
}: TransactionCardProps) {
  const isIncome = transaction.type === 'income'
  const isExpense = transaction.type === 'expense'
  const isTransfer = transaction.type === 'transfer'

  const getAmountDisplay = () => {
    const prefix = isIncome ? '+' : isExpense ? '-' : ''
    return `${prefix}${formatCurrency(transaction.amount)}`
  }

  const getAmountColor = () => {
    if (isIncome) return 'text-income'
    if (isExpense) return 'text-expense'
    return 'text-blue-500'
  }

  return (
    <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            isTransfer
              ? 'bg-blue-100 dark:bg-blue-900/30'
              : transaction.category?.color
                ? `bg-opacity-20`
                : 'bg-muted'
          )}
          style={{
            backgroundColor: isTransfer
              ? undefined
              : transaction.category?.color
                ? `${transaction.category.color}20`
                : undefined,
          }}
        >
          {isTransfer ? (
            <ArrowRightLeft className="h-5 w-5 text-blue-500" />
          ) : (
            <CategoryIcon
              name={transaction.category?.icon}
              color={transaction.category?.color}
              className="h-5 w-5"
            />
          )}
        </div>

        {/* Info */}
        <div>
          <p className="font-medium">
            {transaction.description || transaction.category?.name || 'ไม่มีรายละเอียด'}
          </p>
          <p className="text-sm text-muted-foreground">
            {isTransfer ? (
              <>
                {transaction.account?.name} → {transaction.to_account?.name}
              </>
            ) : (
              <>
                {transaction.account?.name}
                {transaction.category && ` • ${transaction.category.name}`}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Amount & Actions */}
      <div className="flex items-center gap-2">
        <span className={cn('font-bold', getAmountColor())}>
          {getAmountDisplay()}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(transaction)}>
              <Pencil className="mr-2 h-4 w-4" />
              แก้ไข
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(transaction)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              ลบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
