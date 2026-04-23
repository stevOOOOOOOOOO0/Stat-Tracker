import React, { useState, useEffect, useRef } from 'react'
import type { Stat } from '../../../types'
import { useCharacter } from '../../../hooks/useCharacter'
import { useCharacterStore } from '../../../store/characterStore'
import { EmptyState } from '../../../components/ui/EmptyState'
import { SortableList } from '../../../components/shared/SortableList'
import { StatRow } from '../stats/StatRow'
import { StatPopover } from '../stats/StatPopover'
import { StatEditSheet } from '../stats/StatEditSheet'

interface ActiveRoll {
  statId: string
  result: number
  diceTotal: number
}

export function StatsTab() {
  const { character, activeCharacterId } = useCharacter()
  const updateStat = useCharacterStore(s => s.updateStat)

  const [activeStatId, setActiveStatId] = useState<string | null>(null)
  const [editingStat, setEditingStat] = useState<Stat | null | undefined>(undefined)
  const [activeRoll, setActiveRoll] = useState<ActiveRoll | null>(null)
  const rollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleRoll = (statId: string, result: number, diceTotal: number) => {
    if (rollTimerRef.current) clearTimeout(rollTimerRef.current)
    setActiveRoll({ statId, result, diceTotal })
    rollTimerRef.current = setTimeout(() => setActiveRoll(null), 30_000)
  }

  const handleDismissRoll = () => {
    if (rollTimerRef.current) clearTimeout(rollTimerRef.current)
    setActiveRoll(null)
  }

  useEffect(() => {
    return () => { if (rollTimerRef.current) clearTimeout(rollTimerRef.current) }
  }, [])

  if (!character || !activeCharacterId) {
    return <div className="p-4"><EmptyState title="No character loaded" /></div>
  }

  const sortedStats = [...character.stats].sort((a, b) => a.order - b.order)

  const handleReorder = (newStats: Stat[]) => {
    newStats.forEach((s, i) => {
      if (s.order !== i) updateStat(activeCharacterId, { ...s, order: i })
    })
  }

  return (
    <div className="p-2">
      {sortedStats.length === 0 ? (
        <EmptyState title="No stats yet" description="Use the + button to add your first stat." />
      ) : (
        <SortableList
          items={sortedStats}
          keyExtractor={s => s.id}
          onReorder={handleReorder}
          renderItem={(stat, _idx, dragHandleProps) => (
            <StatRow
              key={stat.id}
              stat={stat}
              allStats={sortedStats}
              onOpen={() => setActiveStatId(stat.id)}
              onRoll={handleRoll}
              rollResult={activeRoll?.statId === stat.id ? activeRoll.result : null}
              diceTotal={activeRoll?.statId === stat.id ? activeRoll.diceTotal : null}
              onDismissRoll={handleDismissRoll}
              dragHandleProps={dragHandleProps}
            />
          )}
        />
      )}

      {activeStatId !== null && (() => {
        const activeStat = sortedStats.find(s => s.id === activeStatId)
        return activeStat ? (
          <StatPopover
            stat={activeStat}
            allStats={sortedStats}
            characterId={activeCharacterId}
            onClose={() => setActiveStatId(null)}
            onEdit={() => { setActiveStatId(null); setEditingStat(activeStat) }}
            onRoll={handleRoll}
            onDismissRoll={handleDismissRoll}
            rollResult={activeRoll?.statId === activeStatId ? activeRoll.result : null}
            diceTotal={activeRoll?.statId === activeStatId ? activeRoll.diceTotal : null}
          />
        ) : null
      })()}

      {editingStat !== undefined && (
        <StatEditSheet
          stat={editingStat ?? null}
          isOpen={true}
          onClose={() => setEditingStat(undefined)}
          stats={character.stats}
          items={character.items}
          abilities={character.abilities}
          characterId={activeCharacterId}
        />
      )}
    </div>
  )
}
