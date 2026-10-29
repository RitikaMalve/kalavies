import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

export interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const avatarSizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
} as const

export function Avatar({ src, alt, name, size = 'md', className }: AvatarProps) {
  const initials = name ? getInitials(name) : '?'
  const displayAlt = alt || name || 'Avatar'

  if (src) {
    return (
      <img
        src={src}
        alt={displayAlt}
        className={cn(
          'rounded-full object-cover border border-border-light',
          avatarSizes[size],
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium bg-gold/10 text-gold-dark border border-gold/20',
        avatarSizes[size],
        className
      )}
      title={displayAlt}
    >
      {initials}
    </div>
  )
}
