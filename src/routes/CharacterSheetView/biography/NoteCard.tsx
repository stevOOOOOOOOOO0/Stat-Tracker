import React, { useState } from 'react'
import type { Note } from '../../../types'
import { formatRelative } from '../../../lib/dates'

export interface NoteCardProps {
  note: Note
  onEdit: () => void
  onDelete: () => void
}

export const NoteCard = React.memo(function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="bg-slate-800 rounded-xl p-3 mb-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-100 text-sm leading-snug">{note.title}</p>
          {note.body && <p className="text-slate-400 text-sm mt-1.5 line-clamp-2 leading-snug">{note.body}</p>}
        </div>
        <div className="relative flex-shrink-0">
          <button type="button" onClick={() => setMenuOpen(v => !v)}
            className="text-slate-500 hover:text-slate-300 transition-colors w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-700"
            aria-label="Note options">
            ···
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-20 bg-slate-700 rounded-lg shadow-xl min-w-[120px] overflow-hidden">
              <button type="button" className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-600 transition-colors"
                onClick={() => { setMenuOpen(false); onEdit() }}>Edit</button>
              <button type="button" className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-slate-600 transition-colors"
                onClick={() => { setMenuOpen(false); onDelete() }}>Delete</button>
            </div>
          )}
        </div>
      </div>
      <p className="text-slate-500 text-xs mt-2">{formatRelative(note.updatedAt)}</p>
    </div>
  )
})
