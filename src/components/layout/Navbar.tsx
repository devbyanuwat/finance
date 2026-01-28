import { Menu } from 'lucide-react'
import { UserButton } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './ThemeToggle'

interface NavbarProps {
  onMenuClick: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-primary">Money Manager</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <UserButton
          afterSignOutUrl="/login"
          appearance={{
            elements: {
              avatarBox: 'h-9 w-9',
            },
          }}
        />
      </div>
    </header>
  )
}
