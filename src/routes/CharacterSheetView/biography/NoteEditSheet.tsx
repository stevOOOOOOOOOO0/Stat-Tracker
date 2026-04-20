import React, { useState, useEffect } from 'react'
import type { Note } from '../../../types'
import { useCharacterStore } from '../../../store/characterStore'
import { BottomSheet } from '../../../components/overlays/BottomSheet'
import { ConfirmDialog } from '../../../components/overlays/ConfirmDialog'
import { Input } from '../../../components/ui/Input'
import { TagInput } from '../../../components/ui/TagInput'
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

interface FormState {
  title: string
  tags: string[]
  body: string
}

function emptyForm(): FormState {
  return { title: '', tags: [], body: '' }
}

export function NoteEditSheet({
  note,
  isOpen,
  onClose,
  characterId,
}: NoteEditSheetProps) {
  const addNote = useCharacterStore((s) => s.addNote)
  const updateNote = useCharacterStore((s) => s.updateNote)
  const removeNote = useCharacterStore((s) => s.removeNote)

  const [form, setForm] = useState<FormState>(emptyForm())
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  // Sync form when the sheet opens / note changes
  useEffect(() => {
    if (isOpen) {
      if (note) {
        setForm({ title: note.title, tags: note.tags, body: note.body })
      } else {
        setForm(emptyForm())
      }
    }
  }, [isOpen, note])

  const isEditing = note !== null
  const canSave = form.title.trim().length > 0

  const handleSave = () => {
    if (!canSave) return
    const timestamp = now()

    if (isEditing && note) {
      updateNote(characterId, {
        ...note,
        title: form.title.trim(),
        tags: form.tags,
        body: form.body,
        updatedAt: timestamp,
      })
    } else {
      const newNote: Note = {
        id: generateId(),
        characterId,
        title: form.title.trim(),
        tags: form.tags,
        body: form.body,
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      addNote(characterId, newNote)
    }
    onClose()
  }

  const handleDelete = () => {
    if (note) {
      removeNote(characterId, note.id)
      onClose()
    }
  }

  return (
    <>
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        title={isEditing ? 'Edit Note' : 'New Note'}
      >
        <div className="flex flex-col gap-4 pb-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Note title"
            autoFocus
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Tags
            </label>
            <TagInput
              tags={form.tags}
              onChange={(tags) => setForm((f) => ({ ...f, tags }))}
              placeholder="Add tag..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Body
            </label>
            <MarkdownEditor
              value={form.body}
              onChange={(v) => setForm((f) => ({ ...f, body: v }))}
              placeholder="Write your note in Markdown..."
              rows={6}
            />
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={handleSave}
            disabled={!canSave}
          >
            {isEditing ? 'Save Note' : 'Create Note'}
          </Button>

          {isEditing && (
            <Button
              variant="danger"
              fullWidth
              onClick={() => setConfirmDeleteOpen(true)}
            >
              Delete Note
            </Button>
          )}
        </div>
      </BottomSheet>

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Note"
        description={`Delete "${note?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </>
  )
}
