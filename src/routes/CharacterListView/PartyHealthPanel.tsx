import React, { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import type { Character } from '../../types/character'
import type { Stat } from '../../types/stat'

export interface PartyHealthPanelProps {
  characters: Character[]
}

function findHpStat(stats: Stat[]): Stat | undefined {
  return stats.find(
    (s) =>
      s.name.toLowerCase() === 'hp' ||
      s.name.toLowerCase() === 'hit points' ||
      s.name.toLowerCase().includes('hp') ||
      s.name.toLowerCase().includes('hit points')
  )
}


export function PartyHealthPanel({ characters }: PartyHealthPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (characters.length === 0) return null

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden mb-3">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-700/50 transition-colors"
        aria-expanded={isExpanded}
      >
        <span className="text-sm font-semibold text-slate-300">Party Health</span>
        <span className="text-slate-400 text-sm select-none">{isExpanded ? '▲' : '▼'}</span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div>
          {characters.map((character) => {
            const hpStat = findHpStat(character.stats)
            const visibleConditions = character.appliedConditions.slice(0, 2)

            return (
              <div
                key={character.id}
                className="flex items-center gap-3 px-4 py-2 border-b border-slate-700 last:border-0"
              >
                <span className="text-slate-200 text-sm flex-1 truncate">{character.name}</span>
                {hpStat ? (
                  <span className="text-sm font-medium tabular-nums text-green-400">{hpStat.value}</span>
                ) : (
                  <span className="text-slate-500 text-sm">—</span>
                )}

                {/* Conditions */}
                {visibleConditions.length > 0 && (
                  <div className="flex items-center gap-1">
                    {visibleConditions.map((ac) => (
                      <Badge key={ac.conditionId} variant="red" size="sm">
                        {ac.conditionId}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
