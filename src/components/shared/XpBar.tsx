import React from 'react'

export interface XpBarProps {
  currentXp: number
  threshold?: number
  level: number
}

export function XpBar({ currentXp, threshold, level }: XpBarProps) {
  const fillPercent = threshold
    ? Math.min(100, (currentXp / threshold) * 100)
    : 100

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="bg-indigo-700 text-white font-bold px-2 py-1 rounded text-sm whitespace-nowrap">
        Lv.{level}
      </div>

      <div className="flex-1 flex flex-col gap-1">
        <div className="h-2 bg-slate-700 rounded-full w-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${fillPercent}%` }}
          />
        </div>
      </div>

      <span className="text-sm text-slate-400 whitespace-nowrap">
        {threshold ? `${currentXp} / ${threshold} XP` : 'Milestone'}
      </span>
    </div>
  )
}
