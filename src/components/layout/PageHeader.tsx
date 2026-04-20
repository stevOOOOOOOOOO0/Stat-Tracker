import React from 'react'
import { IconButton } from '../ui/IconButton'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  onBack?: () => void
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, onBack, actions }: PageHeaderProps) {
  return (
    <div className="bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center gap-3">
      {onBack && (
        <IconButton
          icon={<span className="text-base leading-none">←</span>}
          label="Back"
          variant="ghost"
          size="sm"
          onClick={onBack}
        />
      )}

      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-slate-100 truncate">{title}</h1>
        {subtitle && (
          <p className="text-sm text-slate-400 truncate">{subtitle}</p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
      )}
    </div>
  )
}
