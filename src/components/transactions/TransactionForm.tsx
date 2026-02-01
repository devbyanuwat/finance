import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { CalendarIcon, Loader2, ArrowRightLeft, TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { transactionSchema, type TransactionFormData } from '@/lib/validations'
import { useAccounts } from '@/hooks/useAccounts'
import { useCategories } from '@/hooks/useCategories'
import { CategoryIcon } from '@/components/categories'
import type { Transaction, TransactionType } from '@/types/database.types'
import { cn } from '@/lib/utils'

interface TransactionFormProps {
  transaction?: Transaction | null
  defaultType?: TransactionType
  onSubmit: (data: TransactionFormData) => Promise<void>
  onCancel: () => void
}

const transactionTypes = [
  { value: 'expense', label: 'รายจ่าย', icon: TrendingDown, color: 'text-expense' },
  { value: 'income', label: 'รายได้', icon: TrendingUp, color: 'text-income' },
  { value: 'transfer', label: 'โอน', icon: ArrowRightLeft, color: 'text-blue-500' },
] as const

export function TransactionForm({
  transaction,
  defaultType = 'expense',
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const { accounts } = useAccounts()
  const { categories } = useCategories()

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type || defaultType,
      account_id: transaction?.account_id || '',
      to_account_id: transaction?.to_account_id || null,
      category_id: transaction?.category_id || null,
      amount: transaction?.amount || 0,
      description: transaction?.description || '',
      note: transaction?.note || '',
      transaction_date: transaction?.transaction_date
        ? new Date(transaction.transaction_date)
        : new Date(),
      status: (transaction?.status as 'pending' | 'completed' | 'cancelled') || 'completed',
      tags: transaction?.tags || null,
    },
  })

  const isSubmitting = form.formState.isSubmitting
  const watchType = form.watch('type')
  const watchAccountId = form.watch('account_id')
  const watchDate = form.watch('transaction_date')
  const watchStatus = form.watch('status')

  // Auto-set status to pending if date is in the future
  const isFutureDate = watchDate && watchDate > new Date()

  // Filter categories based on transaction type
  const filteredCategories = categories.filter((cat) => {
    if (watchType === 'transfer') return false
    return cat.type === watchType
  })

  // Filter accounts for transfer destination (exclude source account)
  const destinationAccounts = accounts.filter((acc) => acc.id !== watchAccountId)

  const handleSubmit = async (data: TransactionFormData) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Transaction Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ประเภท</FormLabel>
              <div role="radiogroup" aria-label="ประเภทรายการ" className="grid grid-cols-3 gap-2">
                {transactionTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <Button
                      key={type.value}
                      type="button"
                      role="radio"
                      aria-checked={field.value === type.value}
                      variant={field.value === type.value ? 'default' : 'outline'}
                      className={cn(
                        'flex flex-col h-auto py-3',
                        field.value === type.value && type.value === 'expense' && 'bg-expense hover:bg-expense/90',
                        field.value === type.value && type.value === 'income' && 'bg-income hover:bg-income/90',
                        field.value === type.value && type.value === 'transfer' && 'bg-blue-500 hover:bg-blue-600'
                      )}
                      onClick={() => {
                        field.onChange(type.value)
                        // Clear category if switching to transfer
                        if (type.value === 'transfer') {
                          form.setValue('category_id', null)
                        }
                        // Clear to_account if not transfer
                        if (type.value !== 'transfer') {
                          form.setValue('to_account_id', null)
                        }
                      }}
                    >
                      <Icon className="h-5 w-5 mb-1" />
                      {type.label}
                    </Button>
                  )
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>จำนวนเงิน</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  inputMode="decimal"
                  className="text-xl font-bold tabular-nums"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Account */}
        <FormField
          control={form.control}
          name="account_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {watchType === 'transfer' ? 'จากบัญชี' : 'บัญชี'}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกบัญชี" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* To Account (for transfer) */}
        {watchType === 'transfer' && (
          <FormField
            control={form.control}
            name="to_account_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ไปยังบัญชี</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกบัญชีปลายทาง" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {destinationAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Category (for income/expense) */}
        {watchType !== 'transfer' && (
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>หมวดหมู่</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกหมวดหมู่" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <CategoryIcon name={cat.icon} color={cat.color} />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Date */}
        <FormField
          control={form.control}
          name="transaction_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>วันที่</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP', { locale: th })
                      ) : (
                        <span>เลือกวันที่</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date)
                      // Auto-set status to pending if future date, completed if past/today
                      if (date && date > new Date()) {
                        form.setValue('status', 'pending')
                      } else if (date && date <= new Date() && watchStatus === 'pending') {
                        form.setValue('status', 'completed')
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {isFutureDate && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  รายการนี้จะถูกบันทึกเป็น "รอ" เนื่องจากเป็นวันที่อนาคต
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status (only show if editing or if future date) */}
        {(transaction || isFutureDate) && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>สถานะ</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>รอ (ยังไม่ได้รับ/จ่าย)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="completed">
                      <span>เสร็จสิ้น (อัปเดตยอดเงินแล้ว)</span>
                    </SelectItem>
                    <SelectItem value="cancelled">
                      <span>ยกเลิก</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {field.value === 'pending' && 'รายการรอจะไม่อัปเดตยอดเงินในบัญชีจนกว่าจะเปลี่ยนเป็น "เสร็จสิ้น"'}
                  {field.value === 'completed' && 'รายการเสร็จสิ้นจะอัปเดตยอดเงินในบัญชีทันที'}
                  {field.value === 'cancelled' && 'รายการที่ยกเลิกจะไม่ส่งผลต่อยอดเงิน'}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>รายละเอียด</FormLabel>
              <FormControl>
                <Input
                  placeholder="เช่น ค่าอาหารกลางวัน"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Note (optional) */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>หมายเหตุ (ถ้ามี)</FormLabel>
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

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {transaction ? 'บันทึก' : 'เพิ่มรายการ'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
