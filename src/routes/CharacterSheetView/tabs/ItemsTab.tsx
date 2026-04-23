import React from 'react'
import { useCharacter } from '../../../hooks/useCharacter'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ItemList } from '../items/ItemList'

export function ItemsTab() {
  const { character, activeCharacterId } = useCharacter()

  if (!character || !activeCharacterId) {
    return (
      <div className="p-4">
        <EmptyState title="No character loaded" />
      </div>
    )
  }

  return (
    <div className="p-4">
      <ItemList items={character.items} characterId={activeCharacterId} allStats={character.stats} />
    </div>
  )
}
