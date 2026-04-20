import React, { useState } from 'react'
import type { Ability, Stat } from '../../../types'
import { Button } from '../../../components/ui/Button'
import { Toggle } from '../../../components/ui/Toggle'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ConfirmDialog } from '../../../components/overlays/ConfirmDialog'
import { useCharacterStore } from '../../../store/characterStore'
import { AbilityCard } from './AbilityCard'
import { AbilityEditSheet } from './AbilityEditSheet'

export interface AbilityListProps {
  abilities: Ability[]
  stats: Stat[]
  characterId: string
}

export function AbilityList({ abilities, stats, characterId }: AbilityListProps) {
  const removeAbility = useCharacterStore(s => s.removeAbility)

  const [showUnpreparedOnly, setShowUnpreparedOnly] = useState(false)
  const [editingAbility, setEditingAbility] = useState<Ability | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [rollResults, setRollResults] = useState<Record<string, string>>({})

  const sortedAbilities = [...abilities].sort((a, b) => a.order - b.order)

  // Filter: if showUnpreparedOnly is false, show only prepared; if true, show all
  const filtered = showUnpreparedOnly
    ? sortedAbilities
    : sortedAbilities.filter(a => a.prepared === true)

  const handleRollResult = (abilityId: string, result: string) => {
    setRollResults(prev => ({ ...prev, [abilityId]: result }))
  }

  const handleDelete = () => {
    if (confirmDeleteId) {
      removeAbility(characterId, confirmDeleteId)
      setConfirmDeleteId(null)
    }
  }

  const abilityToDelete = confirmDeleteId ? abilities.find(a => a.id === confirmDeleteId) : null

  const emptyMessage = showUnpreparedOnly ? 'No abilities yet' : 'No prepared abilities'
  const emptyDesc = showUnpreparedOnly
    ? 'Add abilities to track your character\'s skills and powers.'
    : 'Toggle "Show all" to see unprepared abilities, or add a new one.'

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2 flex-1">
          <Toggle
            checked={showUnpreparedOnly}
            onChange={setShowUnpreparedOnly}
            label="Show all"
          />
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)} type="button">
          + Add Ability
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={emptyMessage}
          description={emptyDesc}
          action={
            <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
              Add Ability
            </Button>
          }
        />
      ) : (
        <div>
          {filtered.map(ability => (
            <AbilityCard
              key={ability.id}
              ability={ability}
              stats={stats}
              onEdit={() => setEditingAbility(ability)}
              onDelete={() => setConfirmDeleteId(ability.id)}
              characterId={characterId}
              onRollResult={handleRollResult}
              rollResult={rollResults[ability.id]}
            />
          ))}
        </div>
      )}

      {/* Edit sheet */}
      <AbilityEditSheet
        ability={editingAbility}
        isOpen={editingAbility !== null}
        onClose={() => setEditingAbility(null)}
        characterId={characterId}
        stats={stats}
      />

      {/* Create sheet */}
      <AbilityEditSheet
        ability={null}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        characterId={characterId}
        stats={stats}
      />

      {/* Confirm delete */}
      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Ability"
        description={`Are you sure you want to delete "${abilityToDelete?.name}"?`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  )
}
