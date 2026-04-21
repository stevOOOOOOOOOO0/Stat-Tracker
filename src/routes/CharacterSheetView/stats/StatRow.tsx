import React from 'react'
import type { Stat } from '../../../types'

export interface StatRowProps {
  stat: Stat
  onTap: () => void
  dragHandleProps?: React.HTMLAttributes<HTMLElement>
}

export function StatRow({ stat, onTap, dragHandleProps }: StatRowProps) {
  return (
    <div
      className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
      onClick={onTap}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onTap() }}
    >
      {dragHandleProps && (
        <span {...dragHandleProps} className="text-slate-600 text-lg select-none flex-shrink-0" aria-label="Drag to reorder">
          ≡
        </span>
      )}
      <span className="flex-1 text-slate-200 text-sm">{stat.name}</span>
      <span className="text-slate-100 font-semibold text-sm tabular-nums">{stat.value}</span>
      <span className="text-slate-500 text-lg flex-shrink-0">›</span>
    </div>
  )
}
