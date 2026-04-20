import React, { useEffect, useState, useCallback } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { db } from '../../db/index'
import { generateId } from '../../lib/ids'
import { now } from '../../lib/dates'
import type { InitiativeTracker, InitiativeEntry } from '../../types/initiative'

export interface InitiativeTrackerPanelProps {
  campaignId: string
}

export function InitiativeTrackerPanel({ campaignId }: InitiativeTrackerPanelProps) {
  const [tracker, setTracker] = useState<InitiativeTracker | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newInitValue, setNewInitValue] = useState('')

  // Load tracker from DB on mount
  useEffect(() => {
    db.initiativeTrackers.get(campaignId).then((existing) => {
      if (existing) {
        setTracker(existing)
      } else {
        const fresh: InitiativeTracker = {
          campaignId,
          round: 1,
          entries: [],
          updatedAt: now(),
        }
        setTracker(fresh)
      }
    })
  }, [campaignId])

  // Save whenever tracker changes
  const saveTracker = useCallback((updated: InitiativeTracker) => {
    db.initiativeTrackers.put(updated)
  }, [])

  function updateTracker(updated: InitiativeTracker) {
    setTracker(updated)
    saveTracker(updated)
  }

  function handleAddEntry() {
    if (!tracker || !newLabel.trim()) return
    const parsed = parseInt(newInitValue, 10)
    if (isNaN(parsed)) return

    const entry: InitiativeEntry = {
      id: generateId(),
      label: newLabel.trim(),
      initiativeValue: parsed,
      isActive: false,
    }

    const updated: InitiativeTracker = {
      ...tracker,
      entries: [...tracker.entries, entry],
      updatedAt: now(),
    }
    updateTracker(updated)
    setNewLabel('')
    setNewInitValue('')
    setShowAddForm(false)
  }

  function handleDeleteEntry(id: string) {
    if (!tracker) return
    const updated: InitiativeTracker = {
      ...tracker,
      entries: tracker.entries.filter((e) => e.id !== id),
      updatedAt: now(),
    }
    updateTracker(updated)
  }

  function handleNextTurn() {
    if (!tracker || tracker.entries.length === 0) return

    const sorted = [...tracker.entries].sort(
      (a, b) => b.initiativeValue - a.initiativeValue
    )
    const activeIndex = sorted.findIndex((e) => e.isActive)

    let nextIndex: number
    let newRound = tracker.round

    if (activeIndex === -1) {
      // No active — start at first
      nextIndex = 0
    } else if (activeIndex >= sorted.length - 1) {
      // Wrap around
      nextIndex = 0
      newRound = tracker.round + 1
    } else {
      nextIndex = activeIndex + 1
    }

    const updatedEntries = sorted.map((e, i) => ({
      ...e,
      isActive: i === nextIndex,
    }))

    // Re-apply original ids / order by matching id
    const entryMap = new Map(updatedEntries.map((e) => [e.id, e]))
    const reordered = tracker.entries.map((e) => entryMap.get(e.id) ?? e)

    const updated: InitiativeTracker = {
      ...tracker,
      round: newRound,
      entries: reordered,
      updatedAt: now(),
    }
    updateTracker(updated)
  }

  function handleReset() {
    if (!tracker) return
    const updated: InitiativeTracker = {
      ...tracker,
      round: 1,
      entries: tracker.entries.map((e) => ({ ...e, isActive: false })),
      updatedAt: now(),
    }
    updateTracker(updated)
  }

  const sortedEntries = tracker
    ? [...tracker.entries].sort((a, b) => b.initiativeValue - a.initiativeValue)
    : []

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden mb-3">
      {/* Header */}
      <div className="flex items-center px-4 py-3">
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="flex-1 flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
          aria-expanded={isExpanded}
        >
          <span className="text-sm font-semibold text-slate-300">Initiative</span>
          {tracker && (
            <Badge variant="indigo" size="sm">
              Round {tracker.round}
            </Badge>
          )}
          <span className="text-slate-400 text-sm ml-auto select-none">
            {isExpanded ? '▲' : '▼'}
          </span>
        </button>

        {isExpanded && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleNextTurn}
            className="ml-3 flex-shrink-0"
          >
            Next Turn
          </Button>
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-slate-700">
          {sortedEntries.length === 0 ? (
            <p className="text-slate-500 text-sm px-4 py-3">No entries yet.</p>
          ) : (
            <div className="divide-y divide-slate-700">
              {sortedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={[
                    'flex items-center gap-3 px-4 py-2 transition-colors',
                    entry.isActive ? 'bg-indigo-900/50 rounded-lg' : '',
                  ].join(' ')}
                >
                  {/* Initiative value */}
                  <span className="text-indigo-400 font-bold w-8 text-center tabular-nums flex-shrink-0">
                    {entry.initiativeValue}
                  </span>

                  {/* Label */}
                  <span className="flex-1 text-slate-200 text-sm truncate">{entry.label}</span>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDeleteEntry(entry.id)}
                    aria-label={`Remove ${entry.label}`}
                    className="text-slate-500 hover:text-red-400 transition-colors text-base leading-none p-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add form */}
          {showAddForm ? (
            <div className="flex items-end gap-2 px-4 py-3 border-t border-slate-700">
              <div className="flex-1">
                <Input
                  placeholder="Label (e.g. Goblin, Player)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="w-20">
                <Input
                  type="number"
                  placeholder="Init"
                  value={newInitValue}
                  onChange={(e) => setNewInitValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddEntry()
                    if (e.key === 'Escape') setShowAddForm(false)
                  }}
                />
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleAddEntry}
                disabled={!newLabel.trim() || isNaN(parseInt(newInitValue, 10))}
              >
                Add
              </Button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setNewLabel('')
                  setNewInitValue('')
                }}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                aria-label="Cancel"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-2 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
              >
                + Add
              </button>
              {tracker && tracker.entries.length > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-slate-500 hover:text-slate-300 text-sm transition-colors ml-auto"
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
