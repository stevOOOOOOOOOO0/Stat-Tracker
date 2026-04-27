import React, { useEffect, useState } from 'react'
import type { Item } from '../../../types'
import { useCharacterStore } from '../../../store/characterStore'
import { evaluateRoll } from '../../../engine/rollEvaluator'
import type { RollResult } from '../../../engine/rollEvaluator'

export interface ItemPopoverProps {
  item: Item
  characterId: string
  onClose: () => void
  onEdit: () => void
}

export function ItemPopover({ item, characterId, onClose, onEdit }: ItemPopoverProps) {
  const updateItem = useCharacterStore(s => s.updateItem)
  const [rollResult, setRollResult] = useState<RollResult | null>(null)
  const [showBreakdown, setShowBreakdown] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleRoll = () => {
    if (!item.diceFormula) return
    setRollResult(evaluateRoll(item.diceFormula, []))
    setShowBreakdown(false)
  }

  const decrement = () => {
    if (item.quantity === undefined) return
    updateItem(characterId, { ...item, quantity: Math.max(0, item.quantity - 1) })
  }

  const increment = () => {
    if (item.quantity === undefined) return
    updateItem(characterId, { ...item, quantity: item.quantity + 1 })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
    >
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-700/60">
        {/* Header */}
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center justify-end gap-1 mb-2">
            <button
              type="button"
              onClick={() => { onClose(); onEdit() }}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors text-xl"
              aria-label={`Edit ${item.name}`}
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
          <h2 className="text-slate-100 font-semibold text-lg">{item.name}</h2>
        </div>

        {/* Quantity */}
        {item.quantity !== undefined && (
          <div className="flex gap-4 px-5 py-2">
            <button
              type="button"
              onClick={decrement}
              className="flex-1 h-16 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all flex items-center justify-center text-slate-100 text-4xl font-light select-none"
              aria-label={`Decrease ${item.name} quantity`}
            >
              −
            </button>
            <div className="flex flex-col items-center justify-center min-w-[60px]">
              <span className="text-5xl font-bold tabular-nums text-slate-100">{item.quantity}</span>
            </div>
            <button
              type="button"
              onClick={increment}
              className="flex-1 h-16 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all flex items-center justify-center text-slate-100 text-4xl font-light select-none"
              aria-label={`Increase ${item.name} quantity`}
            >
              +
            </button>
          </div>
        )}

        {/* Description */}
        {item.description && (
          <p className="px-5 text-slate-300 text-sm leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Roll */}
        {item.diceFormula && (
          <div className="px-5 pb-5 flex flex-col gap-2" style={{ marginTop: item.description || item.quantity !== undefined ? '12px' : '0' }}>
            <button
              type="button"
              onClick={handleRoll}
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-2 text-white font-medium text-sm"
              aria-label={`Roll ${item.diceFormula}`}
            >
              <span>🎲</span>
              <span>Roll {item.diceFormula}</span>
            </button>
            {rollResult !== null && (
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowBreakdown(v => !v)}
                    className={`text-xs font-mono tabular-nums px-1.5 py-0.5 rounded transition-colors ${
                      showBreakdown
                        ? 'bg-indigo-600/30 text-indigo-300'
                        : 'bg-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                    title={showBreakdown ? 'Hide individual rolls' : 'Show individual rolls'}
                  >
                    {item.diceFormula}
                  </button>
                  <span className="text-xs text-slate-500">=</span>
                  <span className="text-indigo-300 font-bold tabular-nums text-lg">{rollResult.total}</span>
                  <button
                    type="button"
                    onClick={() => setRollResult(null)}
                    className="text-slate-600 hover:text-slate-400 text-xs ml-1"
                  >
                    ✕
                  </button>
                </div>
                {showBreakdown && (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {rollResult.rolls.flatMap(r => r.individual).map((v, i) => (
                      <span key={i} className="text-xs font-mono bg-slate-700 text-slate-300 px-2 py-1 rounded tabular-nums">
                        {v}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bottom padding when no roll section */}
        {!item.diceFormula && <div className="pb-5" />}
      </div>
    </div>
  )
}
