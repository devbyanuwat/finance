import { Pencil, Trash2, Lock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CategoryIcon } from './CategoryIcon'
import type { Category } from '@/types/database.types'
import { cn } from '@/lib/utils'

interface CategoryListProps {
  categories: Category[]
  isLoading: boolean
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export function CategoryList({
  categories,
  isLoading,
  onEdit,
  onDelete,
}: CategoryListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">ไม่มีหมวดหมู่</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Card key={category.id} className="relative hover:shadow-card-hover dark:hover:shadow-card-hover-dark transition-shadow">
          <CardContent className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <CategoryIcon
                  name={category.icon}
                  color={category.color}
                  className="h-5 w-5"
                />
              </div>
              <div>
                <p className="font-medium">{category.name}</p>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    category.type === 'income'
                      ? 'border-income/30 text-income'
                      : 'border-expense/30 text-expense'
                  )}
                >
                  {category.type === 'income' ? 'รายได้' : 'รายจ่าย'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {category.is_default ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>หมวดหมู่เริ่มต้น (ไม่สามารถแก้ไข/ลบได้)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(category)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
