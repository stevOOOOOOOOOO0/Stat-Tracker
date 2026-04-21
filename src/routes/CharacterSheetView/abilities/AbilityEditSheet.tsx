import React, { useState, useEffect } from 'react'
import type { Ability } from '../../../types'
import { BottomSheet } from '../../../components/overlays/BottomSheet'
import { ConfirmDialog } from '../../../components/overlays/ConfirmDialog'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Textarea } from '../../../components/ui/Textarea'
import { useCharacterStore } from '../../../store/characterStore'
import { generateId } from '../../../lib/ids'

export interface AbilityEditSheetProps {
  ability: Ability | null
  isOpen: boolean
  onClose: () => void
  characterId: string
}

export function AbilityEditSheet({ ability, isOpen, onClose, characterId }: AbilityEditSheetProps) {
  const addAbility    = useCharacterStore(s => s.addAbility)
  const updateAbility = useCharacterStore(s => s.updateAbility)
  const removeAbility = useCharacterStore(s => s.removeAbility)
  const characters    = useCharacterStore(s => s.characters)

  const [name, setName]               = useState('')
  const [description, setDescription] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    if (ability) {
      setName(ability.name)
      setDescription(ability.description ?? '')
    } else {
      setName('')
      setDescription('')
    }
  }, [isOpen, ability])

  const handleSave = () => {
    if (!name.trim()) return
    const base = { characterId, name: name.trim(), description: description || undefined }
    if (ability) {
      updateAbility(characterId, { ...ability, ...base })
    } else {
      const character = characters[characterId]
      addAbility(characterId, { id: generateId(), order: character?.abilities.length ?? 0, ...base })
    }
    onClose()
  }

  const handleDelete = () => {
    if (!ability) return
    removeAbility(characterId, ability.id)
    setConfirmDelete(false)
    onClose()
  }

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title={ability ? 'Edit Ability' : 'New Ability'}>
        <div className="space-y-4">
          <Input label="Name" value={name} onChange={e => setName(e.target.value)} placeholder="Ability name" required autoFocus />
          <Textarea label="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe this ability..." rows={4} />
          <div className="flex gap-3 pt-2">
            {ability && <Button variant="danger" size="sm" type="button" onClick={() => setConfirmDelete(true)}>Delete</Button>}
            <div className="flex-1" />
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" type="button" onClick={handleSave} disabled={!name.trim()}>Save</Button>
          </div>
        </div>
      </BottomSheet>
      <ConfirmDialog isOpen={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={handleDelete} title="Delete Ability" description={`Delete "${ability?.name}"?`} confirmLabel="Delete" confirmVariant="danger" />
    </>
  )
}
