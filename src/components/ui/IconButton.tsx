import React from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  label: string
  variant?: Variant
  size?: Size
  className?: string
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100',
  ghost: 'bg-transparent hover:bg-slate-800 text-slate-300',
  danger: 'bg-red-700 hover:bg-red-600 text-white',
}

const sizeClasses: Record<Size, string> = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-11 h-11 text-base',
  lg: 'w-12 h-12 text-lg',
}

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  className = '',
  disabled,
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      aria-label={label}
      className={[
        'inline-flex items-center justify-center rounded-full',
        'font-medium transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'min-w-[44px] min-h-[44px]',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon}
    </button>
  )
}
