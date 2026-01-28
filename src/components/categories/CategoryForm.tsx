import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { categorySchema, type CategoryFormData } from '@/lib/validations'
import type { Category } from '@/types/database.types'
import { CategoryIcon, categoryIcons, categoryColors } from './CategoryIcon'

interface CategoryFormProps {
  category?: Category | null
  onSubmit: (data: CategoryFormData) => Promise<void>
  onCancel: () => void
}

export function CategoryForm({ category, onSubmit, onCancel }: CategoryFormProps) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      type: category?.type || 'expense',
      icon: category?.icon || 'MoreHorizontal',
      color: category?.color || '#6b7280',
      parent_id: category?.parent_id || null,
    },
  })

  const isSubmitting = form.formState.isSubmitting

  const handleSubmit = async (data: CategoryFormData) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ชื่อหมวดหมู่</FormLabel>
              <FormControl>
                <Input placeholder="เช่น ค่าอาหาร, เงินเดือน" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ประเภท</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภท" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="income">
                    <span className="text-income">รายได้</span>
                  </SelectItem>
                  <SelectItem value="expense">
                    <span className="text-expense">รายจ่าย</span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ไอคอน</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'MoreHorizontal'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <CategoryIcon name={field.value} />
                        {field.value}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  {categoryIcons.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      <div className="flex items-center gap-2">
                        <CategoryIcon name={icon} />
                        {icon}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>สี</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || '#6b7280'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: field.value || '#6b7280' }}
                        />
                        {categoryColors.find((c) => c.value === field.value)?.label || 'เลือกสี'}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categoryColors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: color.value }}
                        />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {category ? 'บันทึก' : 'เพิ่มหมวดหมู่'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
