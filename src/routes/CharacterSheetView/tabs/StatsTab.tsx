import React, { useState } from 'react'
import type { Stat } from '../../../types'
import { useCharacter } from '../../../hooks/useCharacter'
import { useCharacterStore } from '../../../store/characterStore'
import { EmptyState } from '../../../components/ui/EmptyState'
import { SortableList } from '../../../components/shared/SortableList'
import { StatRow } from '../stats/StatRow'
import { StatEditSheet } from '../stats/StatEditSheet'

export function StatsTab() {
  const { character, effectiveStats, activeCharacterId } = useCharacter()
  const updateStat = useCharacterStore(s => s.updateStat)

  const [editingStat, setEditingStat] = useState<Stat | null | undefined>(undefined)

  if (!character || !activeCharacterId) {
    return (
      <div className="p-4">
        <EmptyState title="No character loaded" />
      </div>
    )
  }

  const sortedStats = [...character.stats].sort((a, b) => a.order - b.order)

  const getEffectiveValue = (stat: Stat): number | string | boolean => {
    if (stat.category === 'resource') return stat.currentValue ?? 0
    if (stat.category === 'boolean') return stat.value === true
    if (stat.category === 'text') return typeof stat.value === 'string' ? stat.value : ''
    const effective = effectiveStats.find(s => s.id === stat.id)
    if (effective) return typeof effective.value === 'number' ? effective.value : Number(effective.value) || 0
    return typeof stat.value === 'number' ? stat.value : Number(stat.value) || 0
  }

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
              effectiveValue={getEffectiveValue(stat)}
              onTap={() => setEditingStat(stat)}
              dragHandleProps={dragHandleProps}
              characterId={activeCharacterId}
            />
          )}
        />
      )}

      {editingStat !== undefined && (
        <StatEditSheet
          stat={editingStat ?? null}
          isOpen={true}
          onClose={() => setEditingStat(undefined)}
          stats={character.stats}
          characterId={activeCharacterId}
        />
      )}
    </div>
  )
}
