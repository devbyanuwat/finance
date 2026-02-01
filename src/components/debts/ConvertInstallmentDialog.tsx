import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import type { DebtWithRelations } from '@/types/database.types'

interface ConvertInstallmentDialogProps {
  debt: DebtWithRelations | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (debtId: string, count: number, rate: number) => Promise<void>
}

export function ConvertInstallmentDialog({
  debt,
  open,
  onOpenChange,
  onConfirm,
}: ConvertInstallmentDialogProps) {
  const [installmentCount, setInstallmentCount] = useState(6)
  const [interestRate, setInterestRate] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!debt) return null

  const totalWithInterest = debt.total_amount * (1 + interestRate / 100)
  const monthlyPayment = installmentCount > 0 ? totalWithInterest / installmentCount : 0

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm(debt.id, installmentCount, interestRate)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>แปลงเป็นผ่อนชำระ</DialogTitle>
          <DialogDescription>
            แปลงรายการ &quot;{debt.name}&quot; ({formatCurrency(debt.total_amount)}) เป็นผ่อนชำระ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium">จำนวนงวดที่ต้องการผ่อน</label>
            <Input
              type="number"
              min={2}
              value={installmentCount}
              onChange={(e) => setInstallmentCount(parseInt(e.target.value) || 2)}
              className="mt-1.5"
            />
          </div>

          <div>
            <label className="text-sm font-medium">อัตราดอกเบี้ย (%)</label>
            <Input
              type="number"
              step="0.01"
              min={0}
              value={interestRate}
              onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
              className="mt-1.5"
            />
          </div>

          <div className="rounded-xl bg-muted/50 p-3 text-sm">
            <span className="text-muted-foreground">ยอดชำระต่องวด: </span>
            <span className="font-bold text-debt">{formatCurrency(monthlyPayment)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            ยืนยัน
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
