import { cn } from '@/lib/utils'

const spinnerSizes = {
  xs: 'h-3 w-3 border',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
  xl: 'h-12 w-12 border-[3px]',
} as const

export interface SpinnerProps {
  size?: keyof typeof spinnerSizes
  className?: string
  color?: string
}

export function Spinner({ size = 'md', className, color }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block rounded-full border-gold/30 border-t-gold animate-spin',
        spinnerSizes[size],
        color,
        className
      )}
    >
      <span className="sr-only">Loading…</span>
    </div>
  )
}

/** Full-page loading overlay */
export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="xl" />
        <p className="text-sm text-text-secondary">Loading…</p>
      </div>
    </div>
  )
}
