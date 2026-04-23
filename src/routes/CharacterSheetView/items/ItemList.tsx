import React, { useState } from 'react'
import type { Item, Stat } from '../../../types'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ConfirmDialog } from '../../../components/overlays/ConfirmDialog'
import { useCharacterStore } from '../../../store/characterStore'
import { ItemCard } from './ItemCard'
import { ItemEditSheet } from './ItemEditSheet'

export interface ItemListProps {
  items: Item[]
  characterId: string
  allStats?: Stat[]
}

export function ItemList({ items, characterId, allStats = [] }: ItemListProps) {
  const removeItem = useCharacterStore(s => s.removeItem)

  const [editingItem, setEditingItem]   = useState<Item | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const sorted = [...items].sort((a, b) => a.order - b.order)

  const handleDelete = () => {
    if (confirmDeleteId) { removeItem(characterId, confirmDeleteId); setConfirmDeleteId(null) }
  }

  return (
    <div>
      {sorted.length === 0 ? (
        <EmptyState title="No items yet" description="Use the + button to add an item." />
      ) : (
        sorted.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            onEdit={() => setEditingItem(item)}
            onDelete={() => setConfirmDeleteId(item.id)}
          />
        ))
      )}

      <ItemEditSheet
        item={editingItem}
        isOpen={editingItem !== null}
        onClose={() => setEditingItem(null)}
        characterId={characterId}
        allStats={allStats}
      />

      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Item"
        description={`Delete "${items.find(i => i.id === confirmDeleteId)?.name}"?`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  )
}
