import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = {
  default: 'bg-gold/10 text-gold-dark border-gold/20',
  success: 'bg-success-light text-green-800 border-green-200',
  warning: 'bg-warning-light text-amber-800 border-amber-200',
  error: 'bg-error-light text-red-800 border-red-200',
  info: 'bg-info-light text-blue-800 border-blue-200',
  outline: 'bg-transparent text-text-secondary border-border',
} as const

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
} as const

export interface BadgeProps {
  variant?: keyof typeof badgeVariants
  size?: keyof typeof badgeSizes
  children: ReactNode
  className?: string
}

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border whitespace-nowrap',
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}
