import React, { useState, useEffect } from 'react'
import type { Item } from '../../../types'
import { BottomSheet } from '../../../components/overlays/BottomSheet'
import { ConfirmDialog } from '../../../components/overlays/ConfirmDialog'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Textarea } from '../../../components/ui/Textarea'
import { Toggle } from '../../../components/ui/Toggle'
import { NumberStepper } from '../../../components/ui/NumberStepper'
import { useCharacterStore } from '../../../store/characterStore'
import { generateId } from '../../../lib/ids'

export interface ItemEditSheetProps {
  item: Item | null
  isOpen: boolean
  onClose: () => void
  characterId: string
}

export function ItemEditSheet({ item, isOpen, onClose, characterId }: ItemEditSheetProps) {
  const addItem    = useCharacterStore(s => s.addItem)
  const updateItem = useCharacterStore(s => s.updateItem)
  const removeItem = useCharacterStore(s => s.removeItem)
  const characters = useCharacterStore(s => s.characters)

  const [name, setName]               = useState('')
  const [description, setDescription] = useState('')
  const [trackQty, setTrackQty]       = useState(false)
  const [quantity, setQuantity]       = useState(1)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    if (item) {
      setName(item.name)
      setDescription(item.description ?? '')
      setTrackQty(item.quantity !== undefined)
      setQuantity(item.quantity ?? 1)
    } else {
      setName('')
      setDescription('')
      setTrackQty(false)
      setQuantity(1)
    }
  }, [isOpen, item])

  const handleSave = () => {
    if (!name.trim()) return
    const base = {
      characterId,
      name: name.trim(),
      description: description || undefined,
      quantity: trackQty ? quantity : undefined,
    }
    if (item) {
      updateItem(characterId, { ...item, ...base })
    } else {
      const character = characters[characterId]
      addItem(characterId, { id: generateId(), order: character?.items.length ?? 0, ...base })
    }
    onClose()
  }

  const handleDelete = () => {
    if (!item) return
    removeItem(characterId, item.id)
    setConfirmDelete(false)
    onClose()
  }

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title={item ? 'Edit Item' : 'New Item'}>
        <div className="space-y-4">
          <Input label="Name" value={name} onChange={e => setName(e.target.value)} placeholder="Item name" required autoFocus />
          <Textarea label="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe this item..." rows={3} />
          <div className="space-y-2">
            <Toggle checked={trackQty} onChange={v => { setTrackQty(v); if (v && quantity === 0) setQuantity(1) }} label="Track quantity" />
            {trackQty && <NumberStepper value={quantity} onChange={setQuantity} min={0} size="sm" label="Quantity" />}
          </div>
          <div className="flex gap-3 pt-2">
            {item && <Button variant="danger" size="sm" type="button" onClick={() => setConfirmDelete(true)}>Delete</Button>}
            <div className="flex-1" />
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" type="button" onClick={handleSave} disabled={!name.trim()}>Save</Button>
          </div>
        </div>
      </BottomSheet>
      <ConfirmDialog isOpen={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={handleDelete} title="Delete Item" description={`Delete "${item?.name}"?`} confirmLabel="Delete" confirmVariant="danger" />
    </>
  )
}
