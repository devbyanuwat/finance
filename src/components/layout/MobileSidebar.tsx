import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SidebarNav } from './SidebarNav'

interface MobileSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-60 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="text-left text-primary">
            Money Manager
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100dvh-5rem)]">
          <SidebarNav onNavClick={() => onOpenChange(false)} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
