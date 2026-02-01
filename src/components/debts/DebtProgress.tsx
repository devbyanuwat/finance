import { cn } from '@/lib/utils'

interface DebtProgressProps {
  paidCount: number
  installmentCount: number
  className?: string
}

export function DebtProgress({ paidCount, installmentCount, className }: DebtProgressProps) {
  const percentage = Math.min((paidCount / installmentCount) * 100, 100)
  const isComplete = paidCount >= installmentCount

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          {paidCount}/{installmentCount} งวด ({percentage.toFixed(0)}%)
        </span>
        {isComplete && (
          <span className="font-medium text-income">ชำระครบแล้ว</span>
        )}
      </div>
      <div
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary"
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-300',
            isComplete ? 'bg-income' : 'bg-debt'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
