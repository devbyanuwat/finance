import { Wallet } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { AccountCard } from './AccountCard'
import type { Account } from '@/types/database.types'

interface AccountListProps {
  accounts: Account[]
  isLoading: boolean
  onEdit: (account: Account) => void
  onDelete: (account: Account) => void
}

export function AccountList({
  accounts,
  isLoading,
  onEdit,
  onDelete,
}: AccountListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[140px] rounded-lg" />
        ))}
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
        <Wallet className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">ยังไม่มีบัญชี</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          เริ่มต้นโดยการเพิ่มบัญชีแรกของคุณ
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
