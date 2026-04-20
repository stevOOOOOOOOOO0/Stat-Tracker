import React, { useState, useEffect } from 'react'
import { BottomSheet } from '../../../components/overlays/BottomSheet'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { useCharacterStore } from '../../../store/characterStore'
import { generateId } from '../../../lib/ids'

export interface CreateStatBlockSheetProps {
  isOpen: boolean
  onClose: () => void
  characterId: string
}

export function CreateStatBlockSheet({ isOpen, onClose, characterId }: CreateStatBlockSheetProps) {
  const addStatBlock = useCharacterStore(s => s.addStatBlock)
  const characters = useCharacterStore(s => s.characters)
  const [name, setName] = useState('')

  useEffect(() => {
    if (isOpen) setName('')
  }, [isOpen])

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (!trimmed) return

    const character = characters[characterId]
    const order = character ? character.statBlocks.length : 0

    addStatBlock(characterId, {
      id: generateId(),
      characterId,
      name: trimmed,
      order,
      statIds: [],
    })
    onClose()
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="New Stat Block">
      <div className="space-y-4">
        <Input
          label="Block Name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Attributes, Skills, Combat"
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
          autoFocus
        />
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            Create
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
