import { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AccountList, AccountForm } from '@/components/accounts'
import { formatCurrency } from '@/lib/utils'
import { useAccounts } from '@/hooks/useAccounts'
import type { Account } from '@/types/database.types'
import type { AccountFormData } from '@/lib/validations'

export default function Accounts() {
  const {
    accounts,
    isLoading,
    totalBalance,
    totalAssets,
    totalLiabilities,
    createAccount,
    updateAccount,
    deleteAccount,
  } = useAccounts()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

  const handleCreate = () => {
    setSelectedAccount(null)
    setIsFormOpen(true)
  }

  const handleEdit = (account: Account) => {
    setSelectedAccount(account)
    setIsFormOpen(true)
  }

  const handleDelete = (account: Account) => {
    setSelectedAccount(account)
    setIsDeleteOpen(true)
  }

  const handleSubmit = async (data: AccountFormData) => {
    try {
      const accountData = {
        ...data,
        icon: data.icon ?? null,
        color: data.color ?? null,
      }
      if (selectedAccount) {
        await updateAccount(selectedAccount.id, accountData)
        toast.success('แก้ไขบัญชีสำเร็จ')
      } else {
        await createAccount(accountData)
        toast.success('เพิ่มบัญชีสำเร็จ')
      }
      setIsFormOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด')
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedAccount) return

    try {
      await deleteAccount(selectedAccount.id)
      toast.success('ลบบัญชีสำเร็จ')
      setIsDeleteOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด')
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">บัญชี</h1>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มบัญชี
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">มูลค่าสุทธิ</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold tabular-nums ${totalBalance >= 0 ? 'text-income' : 'text-expense'}`}>
                {formatCurrency(totalBalance)}
              </div>
              <p className="text-xs text-muted-foreground">
                สินทรัพย์ - หนี้สิน
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">สินทรัพย์</CardTitle>
              <TrendingUp className="h-4 w-4 text-income" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-income tabular-nums">
                {formatCurrency(totalAssets)}
              </div>
              <p className="text-xs text-muted-foreground">
                เงินสด + ธนาคาร + E-Wallet
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">หนี้สิน</CardTitle>
              <TrendingDown className="h-4 w-4 text-expense" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-expense tabular-nums">
                {formatCurrency(totalLiabilities)}
              </div>
              <p className="text-xs text-muted-foreground">
                บัตรเครดิต
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Account List */}
        <AccountList
          accounts={accounts}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Create/Edit Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedAccount ? 'แก้ไขบัญชี' : 'เพิ่มบัญชีใหม่'}
              </DialogTitle>
            </DialogHeader>
            <AccountForm
              account={selectedAccount}
              onSubmit={handleSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
              <AlertDialogDescription>
                คุณต้องการลบบัญชี "{selectedAccount?.name}" ใช่หรือไม่?
                การดำเนินการนี้ไม่สามารถยกเลิกได้
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                ลบ
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
