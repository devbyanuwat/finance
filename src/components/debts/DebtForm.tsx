import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreditCard, Users, Loader2, CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { debtSchema, type DebtFormData } from '@/lib/validations'
import { useAccounts } from '@/hooks/useAccounts'
import { useCategories } from '@/hooks/useCategories'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import type { DebtWithRelations } from '@/types/database.types'

const debtTypes = [
  { value: 'credit_card_installment' as const, label: 'ผ่อนชำระ', icon: CreditCard },
  { value: 'credit_card_full' as const, label: 'เต็มจำนวน', icon: CreditCard },
  { value: 'personal_loan' as const, label: 'หนี้ส่วนตัว', icon: Users },
]

interface DebtFormProps {
  debt?: DebtWithRelations | null
  onSubmit: (data: DebtFormData) => Promise<void>
  onCancel: () => void
}

export function DebtForm({ debt, onSubmit, onCancel }: DebtFormProps) {
  const { accounts } = useAccounts()
  const { categories } = useCategories()
  const creditCardAccounts = accounts.filter((a) => a.type === 'credit_card' && a.is_active)
  const expenseCategories = categories.filter((c) => c.type === 'expense')

  const form = useForm<DebtFormData>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      name: debt?.name || '',
      debt_type: debt?.debt_type || 'credit_card_installment',
      total_amount: debt?.total_amount || 0,
      installment_count: debt?.installment_count || 1,
      interest_rate: debt?.interest_rate || 0,
      creditor_name: debt?.creditor_name || null,
      account_id: debt?.account_id || null,
      category_id: debt?.category_id || null,
      due_day: debt?.due_day || null,
      start_date: debt?.start_date ? new Date(debt.start_date) : new Date(),
      note: debt?.note || null,
    },
  })

  const watchType = form.watch('debt_type')
  const watchAmount = form.watch('total_amount')
  const watchCount = form.watch('installment_count')
  const watchRate = form.watch('interest_rate')

  // Auto-set installment_count to 1 for full payment
  useEffect(() => {
    if (watchType === 'credit_card_full') {
      form.setValue('installment_count', 1)
    }
  }, [watchType, form])

  const totalWithInterest = watchAmount * (1 + (watchRate || 0) / 100)
  const monthlyPayment = watchCount > 0 ? totalWithInterest / watchCount : 0

  const isCreditCardType = watchType === 'credit_card_installment' || watchType === 'credit_card_full'

  const handleSubmit = async (data: DebtFormData) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Debt Type Selector */}
        <FormField
          control={form.control}
          name="debt_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ประเภท</FormLabel>
              <div className="grid grid-cols-3 gap-2">
                {debtTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => field.onChange(type.value)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl border p-3 text-sm transition-colors',
                      field.value === type.value
                        ? 'border-debt bg-debt/10 text-debt'
                        : 'border-input hover:bg-accent'
                    )}
                  >
                    <type.icon className="h-5 w-5" />
                    {type.label}
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ชื่อรายการ</FormLabel>
              <FormControl>
                <Input placeholder="เช่น iPhone 16 Pro Max" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Total Amount */}
        <FormField
          control={form.control}
          name="total_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>จำนวนเงินรวม</FormLabel>
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

        <div className="grid grid-cols-2 gap-3">
          {/* Installment Count */}
          {watchType !== 'credit_card_full' && (
            <FormField
              control={form.control}
              name="installment_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>จำนวนงวด</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Interest Rate */}
          <FormField
            control={form.control}
            name="interest_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ดอกเบี้ย (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Monthly Payment Preview */}
        {watchAmount > 0 && watchCount > 0 && (
          <div className="rounded-xl bg-muted/50 p-3 text-sm">
            <span className="text-muted-foreground">ยอดชำระต่องวด: </span>
            <span className="font-bold text-debt">{formatCurrency(monthlyPayment)}</span>
            {watchRate > 0 && (
              <span className="text-muted-foreground ml-2">
                (รวมดอกเบี้ย {formatCurrency(totalWithInterest)})
              </span>
            )}
          </div>
        )}

        {/* Credit Card Account */}
        {isCreditCardType && (
          <FormField
            control={form.control}
            name="account_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>บัตรเครดิต</FormLabel>
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกบัตรเครดิต" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {creditCardAccounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Creditor Name (personal loan) */}
        {watchType === 'personal_loan' && (
          <FormField
            control={form.control}
            name="creditor_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ชื่อเจ้าหนี้</FormLabel>
                <FormControl>
                  <Input
                    placeholder="เช่น ชื่อเพื่อน"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Category */}
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>หมวดหมู่ (ไม่บังคับ)</FormLabel>
              <Select
                value={field.value || ''}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          {/* Due Day */}
          <FormField
            control={form.control}
            name="due_day"
            render={({ field }) => (
              <FormItem>
                <FormLabel>วันครบกำหนด (1-31)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    placeholder="เช่น 25"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? parseInt(e.target.value) : null
                      field.onChange(val)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Start Date */}
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>วันที่เริ่มต้น</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value
                          ? format(field.value, 'd MMM yy', { locale: th })
                          : 'เลือกวันที่'}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Note */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>หมายเหตุ</FormLabel>
              <FormControl>
                <Input
                  placeholder="หมายเหตุเพิ่มเติม"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {debt ? 'บันทึก' : 'เพิ่มรายการ'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
