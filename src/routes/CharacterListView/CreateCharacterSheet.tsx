import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomSheet } from '../../components/overlays/BottomSheet'
import { Input } from '../../components/ui/Input'
import { NumberStepper } from '../../components/ui/NumberStepper'
import { Button } from '../../components/ui/Button'
import { useCharacterStore } from '../../store/characterStore'
import { generateId } from '../../lib/ids'
import { now } from '../../lib/dates'

export interface CreateCharacterSheetProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
}

export function CreateCharacterSheet({ isOpen, onClose, campaignId }: CreateCharacterSheetProps) {
  const createCharacter = useCharacterStore((state) => state.createCharacter)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [level, setLevel] = useState(1)
  const [nameError, setNameError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function resetForm() {
    setName('')
    setLevel(1)
    setNameError('')
    setIsSubmitting(false)
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      setNameError('Character name is required.')
      return
    }

    setNameError('')
    setIsSubmitting(true)

    const id = generateId()
    const timestamp = now()

    try {
      await createCharacter({
        id,
        campaignId,
        name: name.trim(),
        level,
        stats: [],
        items: [],
        abilities: [],
        restActions: [],
        appliedConditions: [],
        biography: { characterId: id, sections: [] },
        notes: [],
        history: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      })

      resetForm()
      onClose()
      navigate(`/campaigns/${campaignId}/characters/${id}`)
    } catch {
      setIsSubmitting(false)
    }
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="New Character">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {/* Name */}
        <Input
          label="Name"
          placeholder="Aragorn, Gandalf..."
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (nameError && e.target.value.trim()) setNameError('')
          }}
          error={nameError}
          required
          autoFocus
        />

        {/* Level */}
        <div className="flex flex-col gap-1">
          <span className="block text-sm font-medium text-slate-300">Level</span>
          <div className="flex items-center">
            <NumberStepper
              value={level}
              onChange={setLevel}
              min={1}
              max={20}
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Create Character
        </Button>
      </form>
    </BottomSheet>
  )
}
