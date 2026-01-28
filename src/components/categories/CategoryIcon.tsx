import * as Icons from 'lucide-react'
import { cn } from '@/lib/utils'

// Available icons for categories
export const categoryIcons = [
  'Briefcase', 'Coins', 'Gift', 'Percent', 'TrendingUp', 'Plus',
  'Utensils', 'Home', 'Car', 'Zap', 'Tv', 'ShoppingBag',
  'Heart', 'GraduationCap', 'MoreHorizontal', 'Wallet', 'CreditCard',
  'Plane', 'Coffee', 'Music', 'Book', 'Camera', 'Gamepad2',
  'Smartphone', 'Laptop', 'Watch', 'Shirt', 'Baby', 'Dog',
  'Dumbbell', 'Pill', 'Stethoscope', 'Scissors', 'Wrench', 'Hammer',
] as const

export type CategoryIconName = (typeof categoryIcons)[number]

interface CategoryIconProps {
  name: string | null | undefined
  className?: string
  color?: string | null
}

export function CategoryIcon({ name, className, color }: CategoryIconProps) {
  const iconName = (name || 'MoreHorizontal') as keyof typeof Icons
  const LucideIcon = Icons[iconName] as Icons.LucideIcon | undefined

  if (!LucideIcon) {
    const FallbackIcon = Icons.MoreHorizontal
    return <FallbackIcon className={cn('h-4 w-4', className)} style={{ color: color || undefined }} />
  }

  return <LucideIcon className={cn('h-4 w-4', className)} style={{ color: color || undefined }} />
}

// Icon picker options
export const iconOptions = categoryIcons.map((icon) => ({
  value: icon,
  label: icon,
}))

// Color options for categories
export const categoryColors = [
  { value: '#ef4444', label: 'แดง' },
  { value: '#f97316', label: 'ส้ม' },
  { value: '#eab308', label: 'เหลือง' },
  { value: '#22c55e', label: 'เขียว' },
  { value: '#14b8a6', label: 'เขียวน้ำทะเล' },
  { value: '#3b82f6', label: 'น้ำเงิน' },
  { value: '#8b5cf6', label: 'ม่วง' },
  { value: '#ec4899', label: 'ชมพู' },
  { value: '#6b7280', label: 'เทา' },
]
