import React from 'react'
import { useCharacter } from '../../../hooks/useCharacter'
import { EmptyState } from '../../../components/ui/EmptyState'
import { BiographySectionList } from '../biography/BiographySectionList'
import { NoteList } from '../biography/NoteList'

export function BiographyTab() {
  const { character, activeCharacterId } = useCharacter()

  if (!character || !activeCharacterId) {
    return (
      <div className="p-4">
        <EmptyState title="No character loaded" />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {(character.biography?.sections?.length ?? 0) > 0 && (
        <BiographySectionList
          biography={character.biography}
          characterId={activeCharacterId}
        />
      )}

      {character.notes.length > 0 && (
        <NoteList
          notes={character.notes}
          characterId={activeCharacterId}
        />
      )}
    </div>
  )
}
