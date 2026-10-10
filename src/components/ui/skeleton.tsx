import { cn } from '@/lib/utils'
import React from 'react'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'inline'
}

function Skeleton({
  className,
  variant = 'rectangular',
  ...props
}: SkeletonProps) {
  const baseClasses = 'animate-pulse rounded-md bg-primary/10'
  const variantClasses = {
    text: 'rounded-sm h-4 w-full',
    circular: 'rounded-full aspect-square',
    rectangular: '',
    inline: 'rounded-sm h-6 w-24 inline-block',
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    />
  )
}

Skeleton.displayName = 'Skeleton'
export { Skeleton }
