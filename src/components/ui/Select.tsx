'use client'

import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  placeholder?: string
  selectSize?: 'sm' | 'md' | 'lg'
}

const selectSizes = {
  sm: 'h-8 pl-3 pr-8 text-sm',
  md: 'h-10 pl-3.5 pr-9 text-sm',
  lg: 'h-12 pl-4 pr-10 text-base',
} as const

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      hint,
      options,
      placeholder,
      selectSize = 'md',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full rounded-lg border bg-card-bg text-text-primary appearance-none transition-all duration-200',
              'focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-light-bg',
              selectSizes[selectSize],
              error
                ? 'border-error focus:border-error focus:ring-error/15'
                : 'border-border',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
        {hint && !error && (
          <p className="text-sm text-text-secondary">{hint}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }
