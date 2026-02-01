import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  PiggyBank,
  BarChart3,
  Tags,
  Landmark,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './ThemeToggle'

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  {
    title: 'แดชบอร์ด',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'บัญชี',
    href: '/accounts',
    icon: Wallet,
  },
  {
    title: 'หมวดหมู่',
    href: '/categories',
    icon: Tags,
  },
  {
    title: 'รายการ',
    href: '/transactions',
    icon: Receipt,
  },
  {
    title: 'งบประมาณ',
    href: '/budgets',
    icon: PiggyBank,
  },
  {
    title: 'หนี้สิน',
    href: '/debts',
    icon: Landmark,
  },
  {
    title: 'รายงาน',
    href: '/reports',
    icon: BarChart3,
  },
]

interface SidebarNavProps {
  onNavClick?: () => void
}

export function SidebarNav({ onNavClick }: SidebarNavProps) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          onClick={onNavClick}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-active text-sidebar-active-foreground shadow-sm'
                : 'text-sidebar-muted hover:bg-white/10 hover:text-sidebar-foreground'
            )
          }
        >
          <item.icon className="h-5 w-5" />
          {item.title}
        </NavLink>
      ))}
    </nav>
  )
}

export function SidebarBottomNav() {
  const { signOut } = useAuth()

  return (
    <div className="flex flex-col gap-1 px-3">
      <ThemeToggle variant="sidebar" />
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-3 px-4 py-2.5 text-sidebar-muted hover:bg-white/10 hover:text-sidebar-foreground rounded-xl"
        onClick={signOut}
      >
        <LogOut className="h-5 w-5" />
        ออกจากระบบ
      </Button>
    </div>
  )
}
