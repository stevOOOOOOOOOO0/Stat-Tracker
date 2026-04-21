import React from 'react'
import { useCharacter } from '../../../hooks/useCharacter'
import { EmptyState } from '../../../components/ui/EmptyState'
import { AbilityList } from '../abilities/AbilityList'

export function AbilitiesTab() {
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
      <AbilityList
        abilities={character.abilities}
        characterId={activeCharacterId}
      />
    </div>
  )
}
