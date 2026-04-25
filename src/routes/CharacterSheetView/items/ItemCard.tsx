import React, { memo } from 'react'
import type { Item } from '../../../types'

export interface ItemCardProps {
  item: Item
  onOpen: () => void
  dragHandleProps?: React.HTMLAttributes<HTMLElement>
}

export const ItemCard = memo(function ItemCard({ item, onOpen, dragHandleProps }: ItemCardProps) {
  return (
    <div
      className="py-2 px-3 rounded-lg hover:bg-slate-700/20 active:bg-slate-700/30 transition-colors cursor-pointer"
      onClick={onOpen}
    >
      <div className="flex items-center gap-2">
        {dragHandleProps && (
          <span
            {...dragHandleProps}
            onClick={e => e.stopPropagation()}
            className="text-slate-600 text-lg select-none flex-shrink-0 cursor-grab"
            aria-label="Drag to reorder"
          >
            ≡
          </span>
        )}
        <span className="flex-1 text-slate-200 text-sm font-medium truncate min-w-0">{item.name}</span>
        {item.quantity !== undefined && (
          <span className="text-slate-100 font-bold tabular-nums text-sm flex-shrink-0">{item.quantity}</span>
        )}
      </div>
      {item.description && (
        <p className="text-slate-500 text-xs line-clamp-1 mt-0.5 ml-6">{item.description}</p>
      )}
    </div>
  )
})
