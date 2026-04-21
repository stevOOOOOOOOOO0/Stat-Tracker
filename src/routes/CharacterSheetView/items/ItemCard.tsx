import React, { memo, useState } from 'react'
import type { Item, Stat } from '../../../types'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { useCharacterStore } from '../../../store/characterStore'
import { evaluateRoll } from '../../../engine/rollEvaluator'
import { generateId } from '../../../lib/ids'
import { now } from '../../../lib/dates'

export interface ItemCardProps {
  item: Item
  stats: Stat[]
  onEdit: () => void
  onDelete: () => void
  characterId: string
  onRollResult?: (itemId: string, result: string) => void
  rollResult?: string
}

export const ItemCard = memo(function ItemCard({
  item,
  stats,
  onEdit,
  onDelete,
  characterId,
  onRollResult,
  rollResult,
}: ItemCardProps) {
  const appendHistory = useCharacterStore(s => s.appendHistory)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleRoll = (label: string, formula: string) => {
    const result = evaluateRoll(formula, stats)
    const resultStr = `${label}: ${result.total} (${result.breakdown})`
    onRollResult?.(item.id, resultStr)
    appendHistory(characterId, {
      id: generateId(),
      characterId,
      timestamp: now(),
      type: 'item_used',
      description: resultStr,
      entityId: item.id,
    })
  }

  return (
    <div className="bg-slate-800 rounded-xl p-3 mb-2">
      {/* Header row */}
      <div className="flex items-start gap-2">
        <span className="flex-1 font-semibold text-slate-100 text-sm">{item.name}</span>

        {item.quantity !== undefined && (
          <Badge variant="yellow" size="sm">{item.quantity}</Badge>
        )}

        {/* Context menu */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Item options"
            className="text-slate-500 hover:text-slate-300 transition-colors w-7 h-7 flex items-center justify-center text-base"
          >
            ···
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-slate-700 rounded-lg shadow-xl min-w-[120px] overflow-hidden">
                <button
                  type="button"
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-600 transition-colors"
                  onClick={() => { setMenuOpen(false); onEdit() }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-slate-600 transition-colors"
                  onClick={() => { setMenuOpen(false); onDelete() }}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-slate-400 text-sm line-clamp-2 mt-1">{item.description}</p>
      )}

      {/* Roll buttons */}
      {item.rollExpressions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {item.rollExpressions.map((expr, i) => (
            <Button
              key={i}
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => handleRoll(expr.label || `Roll ${i + 1}`, expr.formula)}
            >
              {expr.label || `Roll ${i + 1}`}: Roll
            </Button>
          ))}
        </div>
      )}

      {/* Roll result */}
      {rollResult && (
        <div className="mt-2 bg-indigo-900/30 border border-indigo-700/40 rounded-lg px-3 py-1.5">
          <p className="text-indigo-300 text-xs font-mono">{rollResult}</p>
        </div>
      )}
    </div>
  )
})
