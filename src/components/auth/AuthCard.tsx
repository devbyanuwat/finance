import type { ReactNode } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AuthCardProps {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function AuthCard({
  title,
  description,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className={cn('w-full max-w-md', className)}>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footer && <CardFooter className="flex justify-center">{footer}</CardFooter>}
      </Card>
    </div>
  )
}
