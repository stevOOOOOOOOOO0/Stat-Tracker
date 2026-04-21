import React, { useState, useEffect } from 'react'
import type { Stat } from '../../../types'
import { BottomSheet } from '../../../components/overlays/BottomSheet'
import { ConfirmDialog } from '../../../components/overlays/ConfirmDialog'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { useCharacterStore } from '../../../store/characterStore'
import { generateId } from '../../../lib/ids'

export interface StatEditSheetProps {
  stat: Stat | null
  isOpen: boolean
  onClose: () => void
  stats: Stat[]
  characterId: string
}

export function StatEditSheet({ stat, isOpen, onClose, stats, characterId }: StatEditSheetProps) {
  const addStat    = useCharacterStore(s => s.addStat)
  const updateStat = useCharacterStore(s => s.updateStat)
  const removeStat = useCharacterStore(s => s.removeStat)

  const [name, setName]   = useState('')
  const [value, setValue] = useState('0')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    if (stat) {
      setName(stat.name)
      setValue(String(stat.value))
    } else {
      setName('')
      setValue('0')
    }
  }, [isOpen, stat])

  const canSave = name.trim().length > 0

  const handleSave = () => {
    if (!canSave) return
    const parsed = parseFloat(value)
    const numValue = isNaN(parsed) ? 0 : parsed
    if (stat) {
      updateStat(characterId, { ...stat, name: name.trim(), value: numValue })
    } else {
      addStat(characterId, {
        id: generateId(),
        name: name.trim(),
        value: numValue,
        order: stats.length,
      })
    }
    onClose()
  }

  const handleDelete = () => {
    if (!stat) return
    removeStat(characterId, stat.id)
    setConfirmDelete(false)
    onClose()
  }

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title={stat ? 'Edit Stat' : 'New Stat'}>
        <div className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. HP, Strength, AC"
            required
            autoFocus
          />
          <Input
            label="Value"
            type="number"
            value={value}
            onChange={e => setValue(e.target.value)}
          />
          <div className="flex gap-3 pt-2">
            {stat && (
              <Button variant="danger" size="sm" type="button" onClick={() => setConfirmDelete(true)}>
                Delete
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" type="button" onClick={handleSave} disabled={!canSave}>
              Save
            </Button>
          </div>
        </div>
      </BottomSheet>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Stat"
        description={`Delete "${stat?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </>
  )
}
