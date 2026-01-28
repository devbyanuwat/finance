import { ScrollArea } from '@/components/ui/scroll-area'
import { SidebarNav } from './SidebarNav'

export function Sidebar() {
  return (
    <aside className="hidden w-60 flex-col border-r bg-card md:flex">
      <ScrollArea className="flex-1 py-4">
        <SidebarNav />
      </ScrollArea>
    </aside>
  )
}
