import React, { useEffect, useRef, useState } from 'react'
import type { Stat } from '../../../types'
import { useCharacterStore } from '../../../store/characterStore'

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

export interface StatPopoverProps {
  stat: Stat
  allStats: Stat[]
  characterId: string
  onClose: () => void
  onEdit: () => void
  onRoll: (statId: string, result: number, diceTotal: number) => void
  onDismissRoll: () => void
  rollResult: number | null
  diceTotal: number | null
}

export function StatPopover({ stat, allStats, characterId, onClose, onEdit, onRoll, onDismissRoll, rollResult, diceTotal }: StatPopoverProps) {
  const incrementStat = useCharacterStore(s => s.incrementStat)
  const decrementStat = useCharacterStore(s => s.decrementStat)
  const cardRef = useRef<HTMLDivElement>(null)
  const [showDiceBreakdown, setShowDiceBreakdown] = useState(false)

  useEffect(() => { setShowDiceBreakdown(false) }, [rollResult])

  const derivedValue = getDerivedValue(stat, allStats)
  const derivedMax   = getDerivedMax(stat, allStats)
  const activeAffectors = allStats.filter(s => s.id !== stat.id && (s.affectees ?? []).some(e => e.id === stat.id))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleRoll = () => {
    const sides = parseInt(stat.diceType.slice(1))
    const diceTotalRolled = Array.from({ length: stat.diceCount }, () =>
      Math.floor(Math.random() * sides) + 1
    ).reduce((a, b) => a + b, 0)
    onRoll(stat.id, diceTotalRolled + derivedValue, diceTotalRolled)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
    >
      <div
        ref={cardRef}
        className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-700/60"
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-5 pt-5 pb-3">
          <h2 className="flex-1 text-slate-100 font-semibold text-lg truncate">{stat.name}</h2>
          <button
            type="button"
            onClick={() => { onClose(); onEdit() }}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors text-xl"
            aria-label={`Edit ${stat.name}`}
          >
            ✎
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors text-xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Value display */}
        <div className="flex flex-col items-center py-2">
          <div className="flex items-baseline gap-1">
            <span className="text-6xl font-bold tabular-nums text-slate-100">{derivedValue}</span>
            {derivedMax !== undefined && (
              <span className="text-2xl text-slate-500 font-medium">/{derivedMax}</span>
            )}
          </div>
          {activeAffectors.length > 0 && (
            <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 mt-2 px-5">
              {activeAffectors.map(s => (
                <span key={s.id} className="text-xs text-slate-500">{s.name}</span>
              ))}
            </div>
          )}
        </div>

        {/* Inc / Dec */}
        <div className="flex gap-4 px-5 py-4">
          <button
            type="button"
            onClick={() => decrementStat(characterId, stat.id)}
            className="flex-1 h-16 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all flex items-center justify-center text-slate-100 text-4xl font-light select-none"
            aria-label={`Decrease ${stat.name}`}
          >
            −
          </button>
          <button
            type="button"
            onClick={() => incrementStat(characterId, stat.id)}
            className="flex-1 h-16 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all flex items-center justify-center text-slate-100 text-4xl font-light select-none"
            aria-label={`Increase ${stat.name}`}
          >
            +
          </button>
        </div>

        {/* Roll section */}
        {stat.isRollable && (
          <div className="px-5 pb-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleRoll}
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-2 text-white font-medium text-sm"
              aria-label={`Roll ${stat.name} check`}
            >
              <span>🎲</span>
              <span>Roll {stat.diceCount}{stat.diceType}</span>
            </button>
            {rollResult !== null && (
              <div className="flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowDiceBreakdown(v => !v)}
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
                <span className="text-indigo-300 font-bold tabular-nums text-lg">{rollResult}</span>
                <button
                  type="button"
                  onClick={onDismissRoll}
                  className="text-slate-600 hover:text-slate-400 text-xs"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bottom padding when not rollable */}
        {!stat.isRollable && <div className="pb-1" />}
      </div>
    </div>
  )
}
