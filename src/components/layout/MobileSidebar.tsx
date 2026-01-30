import { Wallet } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SidebarNav, SidebarBottomNav } from './SidebarNav'

interface MobileSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[260px] rounded-r-2xl border-0 bg-sidebar p-0">
        <SheetHeader className="px-5 pt-6 pb-4">
          <SheetTitle className="flex items-center gap-3 text-left">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-active">
              <Wallet className="h-5 w-5 text-sidebar-active-foreground" />
            </div>
            <span className="text-base font-bold text-sidebar-foreground">
              Money Manager
            </span>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100dvh-10rem)]">
          <SidebarNav onNavClick={() => onOpenChange(false)} />
        </ScrollArea>
        <div className="border-t border-white/10 py-3">
          <SidebarBottomNav />
        </div>
      </SheetContent>
    </Sheet>
  )
}
