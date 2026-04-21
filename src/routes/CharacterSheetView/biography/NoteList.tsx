import React, { useState } from 'react'
import type { Note } from '../../../types'
import { NoteCard } from './NoteCard'
import { NoteEditSheet } from './NoteEditSheet'

export interface NoteListProps {
  notes: Note[]
  characterId: string
}

export function NoteList({ notes, characterId }: NoteListProps) {
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const sorted = [...notes].sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  return (
    <div>
      {sorted.map(note => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={() => setEditingNote(note)}
          onDelete={() => setEditingNote(note)}
        />
      ))}

      <NoteEditSheet
        note={editingNote}
        isOpen={editingNote !== null || isCreateOpen}
        onClose={() => { setEditingNote(null); setIsCreateOpen(false) }}
        characterId={characterId}
      />
    </div>
  )
}
