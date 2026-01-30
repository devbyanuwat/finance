import { Banknote, Building2, CreditCard, Smartphone, Pencil, Trash2, MoreVertical } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Account, AccountType } from '@/types/database.types'
import { cn, formatCurrency } from '@/lib/utils'

interface AccountCardProps {
  account: Account
  onEdit: (account: Account) => void
  onDelete: (account: Account) => void
}

const accountTypeConfig: Record<
  AccountType,
  { label: string; icon: typeof Banknote; color: string; bgColor: string }
> = {
  cash: {
    label: 'เงินสด',
    icon: Banknote,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  bank: {
    label: 'ธนาคาร',
    icon: Building2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  credit_card: {
    label: 'บัตรเครดิต',
    icon: CreditCard,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  e_wallet: {
    label: 'E-Wallet',
    icon: Smartphone,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const config = accountTypeConfig[account.type]
  const Icon = config.icon
  const isCreditCard = account.type === 'credit_card'

  return (
    <Card className={cn('relative hover:shadow-card-hover transition-shadow', !account.is_active && 'opacity-60')}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('rounded-lg p-2', config.bgColor)}>
              <Icon className={cn('h-5 w-5', config.color)} />
            </div>
            <div>
              <h3 className="font-medium">{account.name}</h3>
              <Badge variant="secondary" className="mt-1 text-xs">
                {config.label}
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(account)}>
                <Pencil className="mr-2 h-4 w-4" />
                แก้ไข
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(account)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                ลบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            {isCreditCard ? 'ยอดค้างชำระ' : 'ยอดคงเหลือ'}
          </p>
          <p
            className={cn(
              'text-2xl font-bold tabular-nums',
              isCreditCard && account.balance > 0
                ? 'text-expense'
                : account.balance >= 0
                  ? 'text-income'
                  : 'text-expense'
            )}
          >
            {formatCurrency(account.balance, account.currency)}
          </p>
        </div>

        {!account.is_active && (
          <Badge variant="outline" className="absolute right-4 top-4">
            ไม่ใช้งาน
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}

export { accountTypeConfig, formatCurrency }
