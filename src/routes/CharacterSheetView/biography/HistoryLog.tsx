import React, { useState } from 'react'
import type { HistoryEntry, HistoryEntryType } from '../../../types'
import { useHistory } from '../../../hooks/useHistory'
import { Button } from '../../../components/ui/Button'
import { Textarea } from '../../../components/ui/Textarea'
import { formatRelative } from '../../../lib/dates'

export interface HistoryLogProps {
  history: HistoryEntry[]
  characterId: string
}

const ENTRY_ICONS: Record<HistoryEntryType, string> = {
  stat_change: '📊',
  rest: '💤',
  level_up: '⭐',
  item_used: '⚔️',
  ability_used: '✨',
  condition_change: '🎭',
  currency_change: '💰',
  manual: '📝',
}

export function HistoryLog({ history }: HistoryLogProps) {
  const { appendHistory } = useHistory()
  const [showCount, setShowCount] = useState(50)
  const [isAddingManual, setIsAddingManual] = useState(false)
  const [manualText, setManualText] = useState('')

  const reversed = history.slice().reverse()
  const visible = reversed.slice(0, showCount)

  const handleSubmitManual = () => {
    const text = manualText.trim()
    if (!text) return
    appendHistory({ type: 'manual', description: text })
    setManualText('')
    setIsAddingManual(false)
  }

  return (
    <div>
      {/* Entry list */}
      {visible.length === 0 ? (
        <p className="text-slate-500 text-sm py-2">No history entries yet.</p>
      ) : (
        <div>
          {visible.map((entry) => (
            <div
              key={entry.id}
              className="flex gap-3 py-2 border-b border-slate-800 last:border-b-0"
            >
              <span className="text-lg leading-tight flex-shrink-0 mt-0.5">
                {ENTRY_ICONS[entry.type] ?? '📝'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-slate-300 text-sm leading-snug">
                  {entry.description}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {formatRelative(entry.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {history.length > showCount && (
        <div className="flex justify-center mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCount((c) => c + 50)}
          >
            Load more
          </Button>
        </div>
      )}

      {/* Add manual entry */}
      <div className="mt-3">
        {isAddingManual ? (
          <div className="flex flex-col gap-2">
            <Textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Describe what happened..."
              rows={3}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitManual}
                disabled={!manualText.trim()}
              >
                Submit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingManual(false)
                  setManualText('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingManual(true)}
          >
            + Log Entry
          </Button>
        )}
      </div>
    </div>
  )
}
