import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/* ----------------------------------------
   Card Root
   ---------------------------------------- */
export interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: boolean
}

export function Card({ children, className, hover = false, padding = true }: CardProps) {
  return (
    <div
      className={cn(
        'bg-card-bg border border-border-light rounded-xl shadow-card',
        hover && 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5',
        padding && 'p-5',
        className
      )}
    >
      {children}
    </div>
  )
}

/* ----------------------------------------
   Card Header
   ---------------------------------------- */
export interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between pb-4 mb-4 border-b border-border-light',
        className
      )}
    >
      {children}
    </div>
  )
}

/* ----------------------------------------
   Card Title
   ---------------------------------------- */
export interface CardTitleProps {
  children: ReactNode
  className?: string
  as?: 'h2' | 'h3' | 'h4'
}

export function CardTitle({ children, className, as: Tag = 'h3' }: CardTitleProps) {
  return (
    <Tag
      className={cn(
        'text-lg font-semibold text-dark font-heading',
        className
      )}
    >
      {children}
    </Tag>
  )
}

/* ----------------------------------------
   Card Content
   ---------------------------------------- */
export function CardContent({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn(className)}>{children}</div>
}

/* ----------------------------------------
   Card Footer
   ---------------------------------------- */
export function CardFooter({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 pt-4 mt-4 border-t border-border-light',
        className
      )}
    >
      {children}
    </div>
  )
}

/* ----------------------------------------
   Card Image
   ---------------------------------------- */
export interface CardImageProps {
  src: string
  alt: string
  className?: string
  aspectRatio?: 'square' | 'video' | 'auto'
}

export function CardImage({ src, alt, className, aspectRatio = 'auto' }: CardImageProps) {
  const ratioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: '',
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-t-xl -mx-5 -mt-5 mb-4',
        ratioClasses[aspectRatio],
        className
      )}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
      />
    </div>
  )
}
