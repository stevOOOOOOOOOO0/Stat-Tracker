import React, { useState, useEffect } from 'react'
import type { Item, Stat } from '../../../types'
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
  allStats?: Stat[]
}

export function ItemEditSheet({ item, isOpen, onClose, characterId, allStats = [] }: ItemEditSheetProps) {
  const addItem    = useCharacterStore(s => s.addItem)
  const updateItem = useCharacterStore(s => s.updateItem)
  const removeItem = useCharacterStore(s => s.removeItem)
  const characters = useCharacterStore(s => s.characters)

  const [name, setName]               = useState('')
  const [description, setDescription] = useState('')
  const [trackQty, setTrackQty]       = useState(false)
  const [quantity, setQuantity]       = useState(1)
  const [isRollable, setIsRollable]   = useState(false)
  const [diceFormula, setDiceFormula] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    if (item) {
      setName(item.name)
      setDescription(item.description ?? '')
      setTrackQty(item.quantity !== undefined)
      setQuantity(item.quantity ?? 1)
      setIsRollable(!!item.diceFormula)
      setDiceFormula(item.diceFormula ?? '')
    } else {
      setName('')
      setDescription('')
      setTrackQty(false)
      setQuantity(1)
      setIsRollable(false)
      setDiceFormula('')
    }
    setConfirmDelete(false)
  }, [isOpen, item])

  const canSave = name.trim().length > 0

  const handleSave = () => {
    if (!canSave) return
    const base = {
      characterId,
      name: name.trim(),
      description: description || undefined,
      quantity: trackQty ? quantity : undefined,
      diceFormula: isRollable && diceFormula.trim() ? diceFormula.trim() : undefined,
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

  const header = (
    <div className="flex items-center justify-between gap-3 w-full">
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Item name"
        autoFocus={!item}
        className="flex-1 min-w-0 text-lg font-semibold text-slate-100 bg-transparent placeholder-slate-500 outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 -ml-1"
      />
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex-shrink-0">Item</span>
    </div>
  )

  const footer = (
    <div className="flex gap-3">
      {item && (
        <Button variant="danger" size="sm" type="button" onClick={() => setConfirmDelete(true)}>
          Delete
        </Button>
      )}
      <div className="flex-1" />
      <Button variant="ghost" size="sm" type="button" onClick={onClose}>
        Discard
      </Button>
      <Button variant="primary" size="sm" type="button" onClick={handleSave} disabled={!canSave}>
        Save
      </Button>
    </div>
  )

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title={header} footer={footer} compactHeight="210px">
        <div className="space-y-4">
          {item && (() => {
            const affectingStats = allStats.filter(s => (s.affectees ?? []).some(e => e.id === item.id))
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
          <Textarea label="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe this item..." rows={3} />
          <div className="space-y-2">
            <Toggle checked={trackQty} onChange={v => { setTrackQty(v); if (v && quantity === 0) setQuantity(1) }} label="Track quantity" />
            {trackQty && <NumberStepper value={quantity} onChange={setQuantity} min={0} size="sm" label="Quantity" />}
          </div>
          <div className="space-y-2">
            <Toggle checked={isRollable} onChange={setIsRollable} label="Rollable" />
            {isRollable && (
              <Input
                label="Dice formula"
                value={diceFormula}
                onChange={e => setDiceFormula(e.target.value)}
                placeholder="e.g. 2d6+3, 1d20, 4d4+2"
              />
            )}
          </div>
        </div>
      </BottomSheet>
      <ConfirmDialog isOpen={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={handleDelete} title="Delete Item" description={`Delete "${item?.name}"?`} confirmLabel="Delete" confirmVariant="danger" />
    </>
  )
}
