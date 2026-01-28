import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAccounts } from '@/hooks/useAccounts'
import { useCategories } from '@/hooks/useCategories'
import type { TransactionFilters } from '@/hooks/useTransactions'
import type { TransactionType } from '@/types/database.types'

interface TransactionFilterProps {
  filters: TransactionFilters
  onFiltersChange: (filters: TransactionFilters) => void
}

export function TransactionFilter({
  filters,
  onFiltersChange,
}: TransactionFilterProps) {
  const { accounts } = useAccounts()
  const { categories } = useCategories()

  const hasActiveFilters =
    filters.type ||
    filters.account_id ||
    filters.category_id ||
    filters.search

  const handleClearFilters = () => {
    onFiltersChange({})
  }

  return (
    <div className="flex flex-wrap gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="ค้นหารายการ..."
          className="pl-9"
          value={filters.search || ''}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value || undefined })
          }
        />
      </div>

      {/* Type Filter */}
      <Select
        value={filters.type || 'all'}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            type: value === 'all' ? undefined : (value as TransactionType),
          })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="ประเภท" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ทั้งหมด</SelectItem>
          <SelectItem value="income">รายได้</SelectItem>
          <SelectItem value="expense">รายจ่าย</SelectItem>
          <SelectItem value="transfer">โอน</SelectItem>
        </SelectContent>
      </Select>

      {/* Account Filter */}
      <Select
        value={filters.account_id || 'all'}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            account_id: value === 'all' ? undefined : value,
          })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="บัญชี" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ทุกบัญชี</SelectItem>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Category Filter */}
      <Select
        value={filters.category_id || 'all'}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            category_id: value === 'all' ? undefined : value,
          })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="หมวดหมู่" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={handleClearFilters}>
          <X className="mr-1 h-4 w-4" />
          ล้างตัวกรอง
        </Button>
      )}
    </div>
  )
}
