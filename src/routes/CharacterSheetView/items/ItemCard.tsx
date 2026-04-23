import React, { memo, useState } from 'react'
import type { Item } from '../../../types'
import { Badge } from '../../../components/ui/Badge'

export interface ItemCardProps {
  item: Item
  onEdit: () => void
  onDelete: () => void
  dragHandleProps?: React.HTMLAttributes<HTMLElement>
}

export const ItemCard = memo(function ItemCard({ item, onEdit, onDelete, dragHandleProps }: ItemCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="bg-slate-800 rounded-xl p-3 mb-2">
      <div className="flex items-start gap-2">
        <span
          {...dragHandleProps}
          onClick={e => e.stopPropagation()}
          className="text-slate-600 text-lg select-none flex-shrink-0 cursor-grab mt-0.5"
          aria-label="Drag to reorder"
        >≡</span>
        <span className="flex-1 font-semibold text-slate-100 text-sm">{item.name}</span>
        {item.quantity !== undefined && <Badge variant="yellow" size="sm">{item.quantity}</Badge>}
        <div className="relative flex-shrink-0">
          <button type="button" onClick={() => setMenuOpen(v => !v)} aria-label="Item options"
            className="text-slate-500 hover:text-slate-300 transition-colors w-7 h-7 flex items-center justify-center text-base">
            ···
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-slate-700 rounded-lg shadow-xl min-w-[120px] overflow-hidden">
                <button type="button" className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-600 transition-colors"
                  onClick={() => { setMenuOpen(false); onEdit() }}>Edit</button>
                <button type="button" className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-slate-600 transition-colors"
                  onClick={() => { setMenuOpen(false); onDelete() }}>Delete</button>
              </div>
            </>
          )}
        </div>
      </div>
      {item.description && <p className="text-slate-400 text-sm line-clamp-2 mt-1 ml-6">{item.description}</p>}
    </div>
  )
})
