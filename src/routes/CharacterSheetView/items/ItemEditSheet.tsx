import React, { useState, useEffect } from 'react'
import type { Item, Stat, RollExpression } from '../../../types'
import { BottomSheet } from '../../../components/overlays/BottomSheet'
import { ConfirmDialog } from '../../../components/overlays/ConfirmDialog'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Textarea } from '../../../components/ui/Textarea'
import { Toggle } from '../../../components/ui/Toggle'
import { NumberStepper } from '../../../components/ui/NumberStepper'
import { RollExpressionEditor } from '../../../components/shared/RollExpressionEditor'
import { AffectorSelector } from '../../../components/shared/AffectorSelector'
import { useCharacterStore } from '../../../store/characterStore'
import { generateId } from '../../../lib/ids'

export interface ItemEditSheetProps {
  item: Item | null
  isOpen: boolean
  onClose: () => void
  characterId: string
  stats: Stat[]
}

function buildDefaultItem(characterId: string, order: number): Item {
  return {
    id: generateId(),
    characterId,
    name: '',
    description: '',
    rollExpressions: [],
    affectorIds: [],
    order,
  }
}

export function ItemEditSheet({ item, isOpen, onClose, characterId, stats }: ItemEditSheetProps) {
  const addItem = useCharacterStore(s => s.addItem)
  const updateItem = useCharacterStore(s => s.updateItem)
  const removeItem = useCharacterStore(s => s.removeItem)
  const characters = useCharacterStore(s => s.characters)

  const [draft, setDraft] = useState<Item | null>(null)
  const [trackQuantity, setTrackQuantity] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    if (item) {
      setDraft({ ...item })
      setTrackQuantity(item.quantity !== undefined)
    } else {
      const character = characters[characterId]
      const order = character ? character.items.length : 0
      setDraft(buildDefaultItem(characterId, order))
      setTrackQuantity(false)
    }
  }, [isOpen, item])

  const updateDraft = (updates: Partial<Item>) => {
    setDraft(prev => prev ? { ...prev, ...updates } : prev)
  }

  const handleSave = () => {
    if (!draft || !draft.name.trim()) return
    const finalDraft: Item = {
      ...draft,
      name: draft.name.trim(),
      quantity: trackQuantity ? (draft.quantity ?? 1) : undefined,
    }
    if (item) {
      updateItem(characterId, finalDraft)
    } else {
      addItem(characterId, finalDraft)
    }
    onClose()
  }

  const handleDelete = () => {
    if (!item) return
    removeItem(characterId, item.id)
    setConfirmDelete(false)
    onClose()
  }

  const title = item ? 'Edit Item' : 'New Item'

  if (!draft) return null

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
        <div className="space-y-4">
          <Input
            label="Name"
            value={draft.name}
            onChange={e => updateDraft({ name: e.target.value })}
            placeholder="Item name"
            required
          />

          <Textarea
            label="Description (optional)"
            value={draft.description ?? ''}
            onChange={e => updateDraft({ description: e.target.value })}
            placeholder="Describe this item..."
            rows={3}
          />

          {/* Roll expressions */}
          <div>
            <p className="text-sm font-medium text-slate-300 mb-2">Roll Expressions</p>
            <RollExpressionEditor
              expressions={draft.rollExpressions}
              onChange={exprs => updateDraft({ rollExpressions: exprs as RollExpression[] })}
              stats={stats}
            />
          </div>

          {/* Affectors */}
          <AffectorSelector
            value={draft.affectorIds}
            onChange={ids => updateDraft({ affectorIds: ids })}
            stats={stats}
            label="Affected By Stats"
          />

          {/* Quantity */}
          <div className="space-y-2">
            <Toggle
              checked={trackQuantity}
              onChange={v => {
                setTrackQuantity(v)
                if (v && draft.quantity === undefined) {
                  updateDraft({ quantity: 1 })
                }
              }}
              label="Track quantity"
            />
            {trackQuantity && (
              <NumberStepper
                value={draft.quantity ?? 1}
                onChange={v => updateDraft({ quantity: v })}
                min={0}
                size="sm"
                label="Quantity"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {item && (
              <Button
                variant="danger"
                size="sm"
                type="button"
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="button"
              onClick={handleSave}
              disabled={!draft.name.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      </BottomSheet>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        description={`Are you sure you want to delete "${item?.name}"?`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </>
  )
}
