import React, { useState, useEffect } from 'react'
import type { Stat } from '../../../types'

export interface StatRowProps {
  stat: Stat
  allStats: Stat[]
  onOpen: () => void
  onRoll: (statId: string, result: number, diceTotal: number) => void
  rollResult: number | null
  diceTotal: number | null
  onDismissRoll: () => void
  dragHandleProps?: React.HTMLAttributes<HTMLElement>
}

function getDerivedValue(stat: Stat, allStats: Stat[]): number {
  return stat.baseValue + allStats.reduce((sum, s) => {
    if (s.id === stat.id) return sum
    const e = (s.affectees ?? []).find(e => e.id === stat.id && e.target === 'baseValue')
    return e ? sum + s.baseValue : sum
  }, 0)
}

function getDerivedMax(stat: Stat, allStats: Stat[]): number | undefined {
  if (stat.maxValue === undefined) return undefined
  return stat.maxValue + allStats.reduce((sum, s) => {
    if (s.id === stat.id) return sum
    const e = (s.affectees ?? []).find(e => e.id === stat.id && e.target === 'maxValue')
    return e ? sum + s.baseValue : sum
  }, 0)
}

export function StatRow({ stat, allStats, onOpen, onRoll, rollResult, diceTotal, onDismissRoll, dragHandleProps }: StatRowProps) {
  const derivedValue = getDerivedValue(stat, allStats)
  const derivedMax   = getDerivedMax(stat, allStats)
  const activeAffectors = allStats.filter(s => s.id !== stat.id && (s.affectees ?? []).some(e => e.id === stat.id))
  const [showDiceBreakdown, setShowDiceBreakdown] = useState(false)

  useEffect(() => { setShowDiceBreakdown(false) }, [rollResult])

  const handleRoll = (e: React.MouseEvent) => {
    e.stopPropagation()
    const sides = parseInt(stat.diceType.slice(1))
    const diceTotalRolled = Array.from({ length: stat.diceCount }, () =>
      Math.floor(Math.random() * sides) + 1
    ).reduce((a, b) => a + b, 0)
    onRoll(stat.id, diceTotalRolled + derivedValue, diceTotalRolled)
  }

  return (
    <div
      className="py-2 px-3 rounded-lg hover:bg-slate-700/20 active:bg-slate-700/30 transition-colors cursor-pointer"
      onClick={onOpen}
    >
      <div className="flex items-center gap-2">
        {dragHandleProps && (
          <span
            {...dragHandleProps}
            onClick={e => e.stopPropagation()}
            className="text-slate-600 text-lg select-none flex-shrink-0 cursor-grab"
            aria-label="Drag to reorder"
          >
            ≡
          </span>
        )}

        <span className="flex-1 text-slate-200 text-sm font-medium truncate min-w-0">
          {stat.name}
        </span>

        <div className="text-right flex-shrink-0">
          <span className="text-slate-100 font-bold tabular-nums text-sm">{derivedValue}</span>
          {derivedMax !== undefined && (
            <span className="text-slate-500 text-xs">/{derivedMax}</span>
          )}
        </div>

        {stat.isRollable && (
          <button
            type="button"
            onClick={handleRoll}
            className="flex-shrink-0 px-4 h-12 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white text-sm font-semibold"
            aria-label={`Roll ${stat.name} check`}
          >
            Roll Check
          </button>
        )}
      </div>

      {activeAffectors.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 ml-6">
          {activeAffectors.map(s => (
            <span key={s.id} className="text-xs text-slate-500">{s.name}</span>
          ))}
        </div>
      )}

      {rollResult !== null && (
        <div className="mt-1.5 ml-6 flex items-center gap-1.5">
          <button
            type="button"
            onClick={e => { e.stopPropagation(); setShowDiceBreakdown(v => !v) }}
            className={`text-xs font-mono tabular-nums px-1.5 py-0.5 rounded transition-colors ${
              showDiceBreakdown
                ? 'bg-indigo-600/30 text-indigo-300'
                : 'bg-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={showDiceBreakdown ? 'Show dice notation' : 'Show dice result'}
          >
            {showDiceBreakdown ? diceTotal : `${stat.diceCount}${stat.diceType}`}
          </button>
          <span className="text-xs text-slate-500">+ {derivedValue} =</span>
          <span className="text-indigo-300 font-bold tabular-nums text-sm">{rollResult}</span>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onDismissRoll() }}
            className="text-slate-600 hover:text-slate-400 text-xs ml-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
