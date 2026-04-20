import React from 'react'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      {icon && (
        <div className="text-4xl text-slate-600 flex items-center justify-center">
          {icon}
        </div>
      )}
      <p className="text-slate-300 font-medium text-center">{title}</p>
      {description && (
        <p className="text-slate-500 text-sm text-center max-w-xs">{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
