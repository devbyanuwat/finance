import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { CategorySelector } from '@/components/categories'
import { budgetSchema, type BudgetFormData } from '@/lib/validations'
import type { BudgetWithCategory } from '@/types/database.types'

interface BudgetFormProps {
  budget?: BudgetWithCategory | null
  onSubmit: (data: BudgetFormData) => Promise<void>
  onCancel: () => void
}

export function BudgetForm({ budget, onSubmit, onCancel }: BudgetFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category_id: budget?.category_id || '',
      amount: budget?.amount || 0,
      period: budget?.period || 'monthly',
      alert_threshold: budget?.alert_threshold || 80,
      start_date: budget?.start_date ? new Date(budget.start_date) : null,
    },
  })

  const categoryId = watch('category_id')
  const period = watch('period')
  const alertThreshold = watch('alert_threshold')

  const handleFormSubmit = async (data: BudgetFormData) => {
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Category Selector */}
      <div className="space-y-2">
        <Label>หมวดหมู่ *</Label>
        <CategorySelector
          type="expense"
          value={categoryId}
          onChange={(value) => setValue('category_id', value)}
          disabled={!!budget}
        />
        {errors.category_id && (
          <p className="text-sm text-destructive">{errors.category_id.message}</p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">งบประมาณ (บาท) *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          {...register('amount', { valueAsNumber: true })}
        />
        {errors.amount && (
          <p className="text-sm text-destructive">{errors.amount.message}</p>
        )}
      </div>

      {/* Period */}
      <div className="space-y-2">
        <Label>ระยะเวลา *</Label>
        <Select
          value={period}
          onValueChange={(value) => setValue('period', value as 'monthly' | 'yearly')}
          disabled={!!budget}
        >
          <SelectTrigger>
            <SelectValue placeholder="เลือกระยะเวลา" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">รายเดือน</SelectItem>
            <SelectItem value="yearly">รายปี</SelectItem>
          </SelectContent>
        </Select>
        {errors.period && (
          <p className="text-sm text-destructive">{errors.period.message}</p>
        )}
      </div>

      {/* Alert Threshold */}
      <div className="space-y-3">
        <Label>แจ้งเตือนเมื่อใช้ถึง {alertThreshold}%</Label>
        <Slider
          value={[alertThreshold]}
          onValueChange={(values) => setValue('alert_threshold', values[0])}
          min={50}
          max={100}
          step={5}
          className="py-2"
        />
        <p className="text-sm text-muted-foreground">
          คุณจะได้รับการแจ้งเตือนเมื่อใช้งบประมาณถึง {alertThreshold}% ของงบทั้งหมด
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'กำลังบันทึก...' : budget ? 'อัปเดต' : 'สร้าง'}
        </Button>
      </div>
    </form>
  )
}
