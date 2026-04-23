import React, { useState, useEffect } from 'react'
import type { Ability, Stat } from '../../../types'
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
  allStats?: Stat[]
}

export function AbilityEditSheet({ ability, isOpen, onClose, characterId, allStats = [] }: AbilityEditSheetProps) {
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
          {ability && (() => {
            const affectingStats = allStats.filter(s => (s.affectees ?? []).some(e => e.id === ability.id))
            return affectingStats.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-slate-300 mb-2">Affectors</p>
                <div className="space-y-1">
                  {affectingStats.map(s => (
                    <div key={s.id} className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2">
                      <span className="text-xs text-slate-500 uppercase tracking-wide flex-shrink-0">stat</span>
                      <span className="text-slate-300 text-sm">{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          })()}
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
