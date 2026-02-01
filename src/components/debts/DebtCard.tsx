import { CreditCard, Users, Pencil, Trash2, ArrowRightLeft, MoreVertical } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DebtProgress } from './DebtProgress'
import { formatCurrency } from '@/lib/utils'
import type { DebtWithRelations } from '@/types/database.types'

const debtTypeConfig = {
  credit_card_installment: { label: 'ผ่อนชำระ', className: 'bg-debt/10 text-debt border-debt/20' },
  credit_card_full: { label: 'ชำระเต็มจำนวน', className: 'bg-expense/10 text-expense border-expense/20' },
  personal_loan: { label: 'หนี้ส่วนตัว', className: 'bg-investment/10 text-investment border-investment/20' },
}

const debtStatusConfig = {
  active: { label: 'กำลังชำระ', className: '' },
  completed: { label: 'ชำระครบแล้ว', className: 'bg-income/10 text-income border-income/20' },
  cancelled: { label: 'ยกเลิก', variant: 'destructive' as const },
}

interface DebtCardProps {
  debt: DebtWithRelations
  onEdit: (debt: DebtWithRelations) => void
  onDelete: (debt: DebtWithRelations) => void
  onConvert: (debt: DebtWithRelations) => void
}

export function DebtCard({ debt, onEdit, onDelete, onConvert }: DebtCardProps) {
  const typeConfig = debtTypeConfig[debt.debt_type]
  const statusConfig = debtStatusConfig[debt.status]
  const Icon = debt.debt_type === 'personal_loan' ? Users : CreditCard

  return (
    <Card className={debt.status === 'cancelled' ? 'opacity-60' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-debt/10">
              <Icon className="h-4 w-4 text-debt" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm font-semibold truncate">{debt.name}</CardTitle>
              {debt.creditor_name && (
                <p className="text-xs text-muted-foreground truncate">{debt.creditor_name}</p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(debt)}>
                <Pencil className="mr-2 h-4 w-4" /> แก้ไข
              </DropdownMenuItem>
              {debt.debt_type === 'credit_card_full' && debt.status === 'active' && (
                <DropdownMenuItem onClick={() => onConvert(debt)}>
                  <ArrowRightLeft className="mr-2 h-4 w-4" /> แปลงเป็นผ่อนชำระ
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(debt)}>
                <Trash2 className="mr-2 h-4 w-4" /> ลบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-1.5 mt-1">
          <Badge variant="outline" className={typeConfig.className}>
            {typeConfig.label}
          </Badge>
          <Badge
            variant={statusConfig.variant || 'outline'}
            className={statusConfig.className}
          >
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">ยอดคงเหลือ</p>
            <p className="text-lg font-bold text-debt tabular-nums">
              {formatCurrency(debt.remaining_amount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">ชำระ/งวด</p>
            <p className="text-lg font-bold tabular-nums">
              {formatCurrency(debt.monthly_payment)}
            </p>
          </div>
        </div>

        <DebtProgress
          paidCount={debt.paid_count}
          installmentCount={debt.installment_count}
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
          <span>ยอดรวม: {formatCurrency(debt.total_amount)}</span>
          {debt.due_day && <span>ครบกำหนดวันที่ {debt.due_day} ของเดือน</span>}
        </div>
        {debt.account && (
          <div className="text-xs text-muted-foreground">
            บัญชี: {debt.account.name}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
