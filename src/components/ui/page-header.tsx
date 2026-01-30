import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <h1 className="text-2xl font-bold">{title}</h1>
      {action}
    </div>
  )
}
