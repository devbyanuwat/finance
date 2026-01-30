import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ThemeToggleProps {
  variant?: 'header' | 'sidebar'
}

export function ThemeToggle({ variant = 'header' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  if (variant === 'sidebar') {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-3 px-4 py-2.5 text-sidebar-muted hover:bg-white/10 hover:text-sidebar-foreground rounded-xl"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100 ml-0" />
        <span className="dark:hidden">สว่าง</span>
        <span className="hidden dark:inline">มืด</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun aria-hidden="true" className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon aria-hidden="true" className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          <span className="sr-only">เปลี่ยนธีม</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          สว่าง
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          มืด
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          ระบบ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
