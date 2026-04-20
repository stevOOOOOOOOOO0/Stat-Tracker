import React, { useState, useRef, useEffect } from 'react'
import type { Note } from '../../../types'
import { Badge } from '../../../components/ui/Badge'
import { formatRelative } from '../../../lib/dates'

export interface NoteCardProps {
  note: Note
  onEdit: () => void
  onDelete: () => void
}

export const NoteCard = React.memo(function NoteCard({
  note,
  onEdit,
  onDelete,
}: NoteCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  return (
    <div className="bg-slate-800 rounded-xl p-3 mb-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <p className="font-semibold text-slate-100 text-sm leading-snug">
            {note.title}
          </p>

          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {note.tags.map((tag) => (
                <Badge key={tag} variant="indigo" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Body preview */}
          {note.body && (
            <p className="text-slate-400 text-sm mt-1.5 line-clamp-2 leading-snug">
              {note.body}
            </p>
          )}
        </div>

        {/* Menu button */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="text-slate-500 hover:text-slate-300 transition-colors w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-700"
            aria-label="Note options"
          >
            ···
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-20 bg-slate-700 rounded-lg shadow-xl min-w-[120px] overflow-hidden">
              <button
                type="button"
                className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-600 transition-colors"
                onClick={() => {
                  setMenuOpen(false)
                  onEdit()
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-slate-600 transition-colors"
                onClick={() => {
                  setMenuOpen(false)
                  onDelete()
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="text-slate-500 text-xs mt-2">
        {formatRelative(note.updatedAt)}
      </p>
    </div>
  )
})
