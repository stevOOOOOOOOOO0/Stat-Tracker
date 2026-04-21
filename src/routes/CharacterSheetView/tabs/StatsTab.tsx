import React, { useState } from 'react'
import type { Stat } from '../../../types'
import { useCharacter } from '../../../hooks/useCharacter'
import { useCharacterStore } from '../../../store/characterStore'
import { EmptyState } from '../../../components/ui/EmptyState'
import { SortableList } from '../../../components/shared/SortableList'
import { StatRow } from '../stats/StatRow'
import { StatEditSheet } from '../stats/StatEditSheet'

export function StatsTab() {
  const { character, activeCharacterId } = useCharacter()
  const updateStat = useCharacterStore(s => s.updateStat)

  const [editingStat, setEditingStat] = useState<Stat | null | undefined>(undefined)

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
              onTap={() => setEditingStat(stat)}
              dragHandleProps={dragHandleProps}
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
