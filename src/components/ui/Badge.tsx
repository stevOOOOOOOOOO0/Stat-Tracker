import React from 'react'

type BadgeVariant = 'default' | 'indigo' | 'green' | 'red' | 'yellow' | 'blue'
type BadgeSize = 'sm' | 'md'

export interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-700 text-slate-300',
  indigo: 'bg-indigo-900/60 text-indigo-300',
  green: 'bg-green-900/60 text-green-300',
  red: 'bg-red-900/60 text-red-300',
  yellow: 'bg-yellow-900/60 text-yellow-300',
  blue: 'bg-blue-900/60 text-blue-300',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'text-xs px-1.5 py-0.5 rounded',
  md: 'text-sm px-2 py-0.5 rounded-md',
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
