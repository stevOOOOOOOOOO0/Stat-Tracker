import React from 'react'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-[3px]',
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <span
      className={[
        'inline-block rounded-full animate-spin',
        'border-slate-600 border-t-indigo-400',
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-label="Loading"
    />
  )
}
