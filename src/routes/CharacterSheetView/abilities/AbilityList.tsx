import React, { useState } from 'react'
import type { Ability } from '../../../types'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ConfirmDialog } from '../../../components/overlays/ConfirmDialog'
import { useCharacterStore } from '../../../store/characterStore'
import { AbilityCard } from './AbilityCard'
import { AbilityEditSheet } from './AbilityEditSheet'

export interface AbilityListProps {
  abilities: Ability[]
  characterId: string
}

export function AbilityList({ abilities, characterId }: AbilityListProps) {
  const removeAbility = useCharacterStore(s => s.removeAbility)

  const [editingAbility, setEditingAbility]   = useState<Ability | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const sorted = [...abilities].sort((a, b) => a.order - b.order)

  const handleDelete = () => {
    if (confirmDeleteId) {
      removeAbility(characterId, confirmDeleteId)
      setConfirmDeleteId(null)
    }
  }

  return (
    <div>
      {sorted.length === 0 ? (
        <EmptyState title="No abilities yet" description="Use the + button to add an ability." />
      ) : (
        sorted.map(ability => (
          <AbilityCard
            key={ability.id}
            ability={ability}
            onEdit={() => setEditingAbility(ability)}
            onDelete={() => setConfirmDeleteId(ability.id)}
          />
        ))
      )}

      <AbilityEditSheet
        ability={editingAbility}
        isOpen={editingAbility !== null}
        onClose={() => setEditingAbility(null)}
        characterId={characterId}
      />

      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Ability"
        description={`Delete "${abilities.find(a => a.id === confirmDeleteId)?.name}"?`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  )
}
