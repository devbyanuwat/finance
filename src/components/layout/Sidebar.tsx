import { Wallet } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SidebarNav, SidebarBottomNav } from './SidebarNav'

export function Sidebar() {
  return (
    <aside className="hidden w-[260px] flex-col p-4 md:flex">
      <div className="flex h-full flex-col rounded-2xl bg-sidebar shadow-float">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 pt-6 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-active">
            <Wallet className="h-5 w-5 text-sidebar-active-foreground" />
          </div>
          <span className="text-base font-bold text-sidebar-foreground">
            Money Manager
          </span>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <SidebarNav />
        </ScrollArea>

        {/* Bottom section */}
        <div className="border-t border-white/10 py-3">
          <SidebarBottomNav />
        </div>
      </div>
    </aside>
  )
}
