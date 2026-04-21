import React, { useState, useEffect } from 'react'
import type { Note } from '../../../types'
import { useCharacterStore } from '../../../store/characterStore'
import { BottomSheet } from '../../../components/overlays/BottomSheet'
import { ConfirmDialog } from '../../../components/overlays/ConfirmDialog'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { MarkdownEditor } from '../../../components/shared/MarkdownEditor'
import { generateId } from '../../../lib/ids'
import { now } from '../../../lib/dates'

export interface NoteEditSheetProps {
  note: Note | null
  isOpen: boolean
  onClose: () => void
  characterId: string
}

export function NoteEditSheet({ note, isOpen, onClose, characterId }: NoteEditSheetProps) {
  const addNote    = useCharacterStore(s => s.addNote)
  const updateNote = useCharacterStore(s => s.updateNote)
  const removeNote = useCharacterStore(s => s.removeNote)

  const [title, setTitle] = useState('')
  const [body, setBody]   = useState('')
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTitle(note?.title ?? '')
      setBody(note?.body ?? '')
    }
  }, [isOpen, note])

  const canSave = title.trim().length > 0

  const handleSave = () => {
    if (!canSave) return
    const timestamp = now()
    if (note) {
      updateNote(characterId, { ...note, title: title.trim(), body, updatedAt: timestamp })
    } else {
      addNote(characterId, { id: generateId(), characterId, title: title.trim(), body, createdAt: timestamp, updatedAt: timestamp })
    }
    onClose()
  }

  const handleDelete = () => {
    if (note) { removeNote(characterId, note.id); onClose() }
  }

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title={note ? 'Edit Note' : 'New Note'}>
        <div className="flex flex-col gap-4 pb-4">
          <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title" autoFocus />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Body</label>
            <MarkdownEditor value={body} onChange={setBody} placeholder="Write your note..." rows={6} />
          </div>
          <Button variant="primary" fullWidth onClick={handleSave} disabled={!canSave}>
            {note ? 'Save Note' : 'Create Note'}
          </Button>
          {note && <Button variant="danger" fullWidth onClick={() => setConfirmDeleteOpen(true)}>Delete Note</Button>}
        </div>
      </BottomSheet>
      <ConfirmDialog isOpen={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)} onConfirm={handleDelete} title="Delete Note" description={`Delete "${note?.title}"?`} confirmLabel="Delete" confirmVariant="danger" />
    </>
  )
}
