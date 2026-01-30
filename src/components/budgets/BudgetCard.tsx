import { Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BudgetProgress } from './BudgetProgress'
import { CategoryIcon } from '@/components/categories'
import { formatCurrency } from '@/components/accounts'
import type { BudgetWithCategory } from '@/types/database.types'

interface BudgetCardProps {
  budget: BudgetWithCategory
  onEdit: (budget: BudgetWithCategory) => void
  onDelete: (budget: BudgetWithCategory) => void
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const spent = budget.spent || 0
  const remaining = budget.amount - spent

  return (
    <Card className="hover:shadow-card-hover transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          {budget.category && (
            <CategoryIcon
              name={budget.category.icon}
              color={budget.category.color}
            />
          )}
          <div>
            <CardTitle className="text-base font-medium">
              {budget.category?.name || 'หมวดหมู่ที่ถูกลบ'}
            </CardTitle>
            <Badge variant="outline" className="mt-1">
              {budget.period === 'monthly' ? 'รายเดือน' : 'รายปี'}
            </Badge>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(budget)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(budget)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-baseline">
          <div>
            <p className="text-sm text-muted-foreground">ใช้ไปแล้ว</p>
            <p className="text-xl font-bold">{formatCurrency(spent)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">งบประมาณ</p>
            <p className="text-xl font-bold">{formatCurrency(budget.amount)}</p>
          </div>
        </div>

        <BudgetProgress
          spent={spent}
          budget={budget.amount}
          alertThreshold={budget.alert_threshold}
        />

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">คงเหลือ</span>
          <span
            className={remaining >= 0 ? 'text-income font-medium' : 'text-expense font-medium'}
          >
            {formatCurrency(Math.abs(remaining))}
            {remaining < 0 && ' (เกินงบ)'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
