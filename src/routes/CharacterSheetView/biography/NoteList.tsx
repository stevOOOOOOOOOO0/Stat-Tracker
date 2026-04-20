import React, { useState } from 'react'
import type { Note } from '../../../types'
import { Button } from '../../../components/ui/Button'
import { NoteCard } from './NoteCard'
import { NoteEditSheet } from './NoteEditSheet'

export interface NoteListProps {
  notes: Note[]
  characterId: string
}

export function NoteList({ notes, characterId }: NoteListProps) {
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Collect unique tags across all notes
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags)))

  // Filter notes
  const filteredNotes = activeTagFilter
    ? notes.filter((n) => n.tags.includes(activeTagFilter))
    : notes

  const handleEdit = (note: Note) => {
    setEditingNote(note)
  }

  const handleDelete = () => {
    // Deletion handled inside NoteEditSheet via ConfirmDialog + removeNote
  }

  const closeSheet = () => {
    setEditingNote(null)
    setIsCreateOpen(false)
  }

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Tag filters */}
        <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {allTags.length > 0 && (
            <>
              {activeTagFilter !== null && (
                <button
                  type="button"
                  onClick={() => setActiveTagFilter(null)}
                  className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                >
                  Clear
                </button>
              )}
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setActiveTagFilter(tag === activeTagFilter ? null : tag)
                  }
                  className={[
                    'flex-shrink-0 text-xs px-2.5 py-1 rounded-full transition-colors',
                    activeTagFilter === tag
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600',
                  ].join(' ')}
                >
                  {tag}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Add Note button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="flex-shrink-0"
        >
          + Add Note
        </Button>
      </div>

      {/* Note cards */}
      {filteredNotes.length === 0 ? (
        <p className="text-slate-500 text-sm py-2">
          {activeTagFilter
            ? `No notes tagged '${activeTagFilter}'.`
            : 'No notes yet.'}
        </p>
      ) : (
        filteredNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={() => handleEdit(note)}
            onDelete={() => handleEdit(note)}
          />
        ))
      )}

      {/* Edit sheet */}
      <NoteEditSheet
        note={editingNote}
        isOpen={editingNote !== null || isCreateOpen}
        onClose={closeSheet}
        characterId={characterId}
      />
    </div>
  )
}
