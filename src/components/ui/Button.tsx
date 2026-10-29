'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const variants = {
  primary:
    'bg-gold text-white hover:bg-gold-dark active:bg-gold-dark shadow-gold hover:shadow-gold-hover',
  secondary:
    'bg-rose-gold text-white hover:bg-rose-gold-dark active:bg-rose-gold-dark',
  outline:
    'border border-gold text-gold hover:bg-gold hover:text-white',
  ghost:
    'text-text-secondary hover:bg-border-light hover:text-text-primary',
  danger:
    'bg-error text-white hover:bg-red-700 active:bg-red-800',
} as const

const sizes = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-lg',
} as const

export type ButtonVariant = keyof typeof variants
export type ButtonSize = keyof typeof sizes

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  asChild?: boolean
  href?: string
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      asChild,
      href,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    const classes = cn(
      'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      variants[variant],
      sizes[size],
      fullWidth && 'w-full',
      className
    )

    if (asChild && href) {
      return (
        <a href={href} className={classes}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {!loading && leftIcon}
          {children}
          {!loading && rightIcon}
        </a>
      )
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
