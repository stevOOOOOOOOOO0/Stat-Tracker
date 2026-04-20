import React, { useState } from 'react'
import { BottomSheet } from '../../components/overlays/BottomSheet'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useCampaign } from '../../hooks/useCampaign'

export interface CreateCampaignSheetProps {
  isOpen: boolean
  onClose: () => void
}

const SYSTEM_SUGGESTIONS = [
  'D&D 5e',
  'Pathfinder 2e',
  'Call of Cthulhu',
  'Blades in the Dark',
  'Custom',
]

export function CreateCampaignSheet({ isOpen, onClose }: CreateCampaignSheetProps) {
  const { createCampaign } = useCampaign()

  const [name, setName] = useState('')
  const [system, setSystem] = useState('')
  const [nameError, setNameError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function resetForm() {
    setName('')
    setSystem('')
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
      setNameError('Campaign name is required.')
      return
    }

    setNameError('')
    setIsSubmitting(true)

    try {
      await createCampaign({
        name: name.trim(),
        system: system.trim() || 'Generic',
      })
      resetForm()
      onClose()
    } catch {
      setIsSubmitting(false)
    }
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="New Campaign">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {/* Name field */}
        <Input
          label="Name"
          placeholder="My Epic Campaign"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (nameError && e.target.value.trim()) setNameError('')
          }}
          error={nameError}
          required
          autoFocus
        />

        {/* System field with datalist */}
        <div className="w-full">
          <label
            htmlFor="campaign-system"
            className="block text-sm font-medium text-slate-300 mb-1"
          >
            System
          </label>
          <input
            id="campaign-system"
            list="system-suggestions"
            value={system}
            onChange={(e) => setSystem(e.target.value)}
            placeholder="D&D 5e, Pathfinder 2e, Custom..."
            className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 focus:outline-none text-slate-100 placeholder:text-slate-500 rounded-lg px-3 py-2 transition-colors"
          />
          <datalist id="system-suggestions">
            {SYSTEM_SUGGESTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Create Campaign
        </Button>
      </form>
    </BottomSheet>
  )
}
