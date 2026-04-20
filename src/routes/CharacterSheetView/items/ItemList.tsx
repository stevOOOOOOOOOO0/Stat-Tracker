import React, { useState } from 'react'
import type { Item, Stat } from '../../../types'
import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ConfirmDialog } from '../../../components/overlays/ConfirmDialog'
import { useCharacterStore } from '../../../store/characterStore'
import { ItemCard } from './ItemCard'
import { ItemEditSheet } from './ItemEditSheet'

export interface ItemListProps {
  items: Item[]
  stats: Stat[]
  characterId: string
}

export function ItemList({ items, stats, characterId }: ItemListProps) {
  const removeItem = useCharacterStore(s => s.removeItem)

  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [rollResults, setRollResults] = useState<Record<string, string>>({})

  const sortedItems = [...items].sort((a, b) => a.order - b.order)

  const handleRollResult = (itemId: string, result: string) => {
    setRollResults(prev => ({ ...prev, [itemId]: result }))
  }

  const handleDelete = () => {
    if (confirmDeleteId) {
      removeItem(characterId, confirmDeleteId)
      setConfirmDeleteId(null)
    }
  }

  const itemToDelete = confirmDeleteId ? items.find(i => i.id === confirmDeleteId) : null

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-300">Items</span>
        <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)} type="button">
          + Add Item
        </Button>
      </div>

      {sortedItems.length === 0 ? (
        <EmptyState
          title="No items yet"
          description="Add items to track your equipment and inventory."
          action={
            <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
              Add Item
            </Button>
          }
        />
      ) : (
        <div>
          {sortedItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              stats={stats}
              onEdit={() => setEditingItem(item)}
              onDelete={() => setConfirmDeleteId(item.id)}
              characterId={characterId}
              onRollResult={handleRollResult}
              rollResult={rollResults[item.id]}
            />
          ))}
        </div>
      )}

      {/* Edit sheet */}
      <ItemEditSheet
        item={editingItem}
        isOpen={editingItem !== null}
        onClose={() => setEditingItem(null)}
        characterId={characterId}
        stats={stats}
      />

      {/* Create sheet */}
      <ItemEditSheet
        item={null}
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
        title="Delete Item"
        description={`Are you sure you want to delete "${itemToDelete?.name}"?`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  )
}
