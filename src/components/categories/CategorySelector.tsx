import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { CategoryIcon } from './CategoryIcon'
import { useCategories } from '@/hooks/useCategories'
import type { CategoryType } from '@/types/database.types'

interface CategorySelectorProps {
  value: string | undefined
  onChange: (value: string) => void
  type?: CategoryType
  placeholder?: string
  disabled?: boolean
}

export function CategorySelector({
  value,
  onChange,
  type,
  placeholder = 'เลือกหมวดหมู่',
  disabled,
}: CategorySelectorProps) {
  const { categories, isLoading } = useCategories(type)

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />
  }

  const incomeCategories = categories.filter((c) => c.type === 'income')
  const expenseCategories = categories.filter((c) => c.type === 'expense')

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {type ? (
          // Show only filtered type
          categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              <div className="flex items-center gap-2">
                <CategoryIcon name={cat.icon} color={cat.color} />
                {cat.name}
              </div>
            </SelectItem>
          ))
        ) : (
          // Show grouped by type
          <>
            {incomeCategories.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  รายได้
                </div>
                {incomeCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <CategoryIcon name={cat.icon} color={cat.color} />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </>
            )}
            {expenseCategories.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  รายจ่าย
                </div>
                {expenseCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <CategoryIcon name={cat.icon} color={cat.color} />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </>
            )}
          </>
        )}
      </SelectContent>
    </Select>
  )
}
