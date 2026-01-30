import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  PiggyBank,
  BarChart3,
  Tags,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <nav className="flex flex-col gap-1 p-2">
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          onClick={onNavClick}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
