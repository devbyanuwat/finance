import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Receipt, ArrowRightLeft, Pencil, Trash2, MoreVertical } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CategoryIcon } from '@/components/categories'
import { formatCurrency } from '@/components/accounts'
import { cn } from '@/lib/utils'
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
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12">
        <Receipt className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">ยังไม่มีรายการ</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          เริ่มต้นโดยการเพิ่มรายการแรกของคุณ
        </p>
      </div>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>รายการ</TableHead>
            <TableHead className="hidden sm:table-cell">วันที่</TableHead>
            <TableHead className="hidden md:table-cell">บัญชี</TableHead>
            <TableHead className="text-right">จำนวน</TableHead>
            <TableHead className="hidden sm:table-cell">ประเภท</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const isIncome = transaction.type === 'income'
            const isExpense = transaction.type === 'expense'
            const isTransfer = transaction.type === 'transfer'

            return (
              <TableRow key={transaction.id}>
                {/* Transaction name + icon */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                        isTransfer
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : 'bg-muted'
                      )}
                      style={{
                        backgroundColor:
                          !isTransfer && transaction.category?.color
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
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {transaction.description ||
                          transaction.category?.name ||
                          'ไม่มีรายละเอียด'}
                      </p>
                      <p className="truncate text-xs text-muted-foreground sm:hidden">
                        {format(new Date(transaction.transaction_date), 'd MMM yy', { locale: th })}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Date */}
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {format(new Date(transaction.transaction_date), 'd MMM yy', { locale: th })}
                </TableCell>

                {/* Account */}
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {isTransfer
                    ? `${transaction.account?.name} → ${transaction.to_account?.name}`
                    : transaction.account?.name}
                </TableCell>

                {/* Amount */}
                <TableCell className="text-right">
                  <span
                    className={cn(
                      'font-bold tabular-nums',
                      isIncome && 'text-income',
                      isExpense && 'text-expense',
                      isTransfer && 'text-blue-500'
                    )}
                  >
                    {isIncome ? '+' : isExpense ? '-' : ''}
                    {formatCurrency(transaction.amount)}
                  </span>
                </TableCell>

                {/* Type badge */}
                <TableCell className="hidden sm:table-cell">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      isIncome && 'border-income/30 text-income',
                      isExpense && 'border-expense/30 text-expense',
                      isTransfer && 'border-blue-500/30 text-blue-500'
                    )}
                  >
                    {isIncome ? 'รายได้' : isExpense ? 'รายจ่าย' : 'โอน'}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell>
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
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
