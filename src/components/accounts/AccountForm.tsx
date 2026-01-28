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
import { accountSchema, type AccountFormData } from '@/lib/validations'
import type { Account } from '@/types/database.types'
import { accountTypeConfig } from './AccountCard'

interface AccountFormProps {
  account?: Account | null
  onSubmit: (data: AccountFormData) => Promise<void>
  onCancel: () => void
}

export function AccountForm({ account, onSubmit, onCancel }: AccountFormProps) {
  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: account?.name || '',
      type: account?.type || 'bank',
      balance: account?.balance || 0,
      currency: account?.currency || 'THB',
      is_active: account?.is_active ?? true,
      icon: account?.icon || null,
      color: account?.color || null,
    },
  })

  const isSubmitting = form.formState.isSubmitting

  const handleSubmit = async (data: AccountFormData) => {
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
              <FormLabel>ชื่อบัญชี</FormLabel>
              <FormControl>
                <Input placeholder="เช่น บัญชีออมทรัพย์ กสิกร" {...field} />
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
              <FormLabel>ประเภทบัญชี</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภทบัญชี" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(accountTypeConfig).map(([value, config]) => {
                    const Icon = config.icon
                    return (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${config.color}`} />
                          {config.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {form.watch('type') === 'credit_card'
                  ? 'ยอดค้างชำระ'
                  : 'ยอดเริ่มต้น'}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
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
            {account ? 'บันทึก' : 'เพิ่มบัญชี'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
