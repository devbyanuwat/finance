import { cn } from '@/lib/utils'

interface BudgetProgressProps {
  spent: number
  budget: number
  alertThreshold: number
  className?: string
}

export function BudgetProgress({
  spent,
  budget,
  alertThreshold,
  className,
}: BudgetProgressProps) {
  const percentage = Math.min((spent / budget) * 100, 100)
  const isOverBudget = spent > budget
  const isNearThreshold = percentage >= alertThreshold

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          {percentage.toFixed(0)}% ใช้ไป
        </span>
        <span
          className={cn(
            'font-medium',
            isOverBudget
              ? 'text-destructive'
              : isNearThreshold
                ? 'text-warning'
                : 'text-muted-foreground'
          )}
        >
          {isOverBudget ? 'เกินงบ!' : isNearThreshold ? 'ใกล้ถึงขีดจำกัด' : ''}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`งบประมาณใช้ไป ${percentage.toFixed(0)}%`}
        className="relative h-3 w-full overflow-hidden rounded-full bg-secondary"
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-300',
            isOverBudget
              ? 'bg-destructive'
              : isNearThreshold
                ? 'bg-yellow-500'
                : 'bg-primary'
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
        {/* Alert threshold indicator */}
        <div
          className="absolute top-0 h-full w-0.5 bg-muted-foreground/50"
          style={{ left: `${alertThreshold}%` }}
        />
      </div>
    </div>
  )
}
