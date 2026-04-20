import React from 'react'

export interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  pressable?: boolean
}

export function Card({ children, className = '', onClick, pressable = false }: CardProps) {
  const isInteractive = Boolean(onClick) || pressable

  return (
    <div
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive && onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={[
        'bg-slate-800 rounded-xl p-4 border border-slate-700',
        isInteractive
          ? 'cursor-pointer active:scale-[0.98] transition-transform'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}
