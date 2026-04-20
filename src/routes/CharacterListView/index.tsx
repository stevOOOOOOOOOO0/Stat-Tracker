import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { PageHeader } from '../../components/layout/PageHeader'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { BottomSheet } from '../../components/overlays/BottomSheet'
import { SearchOverlay } from '../../components/overlays/SearchOverlay'
import { MarkdownEditor } from '../../components/shared/MarkdownEditor'
import { useUIStore } from '../../store/uiStore'
import { useCharacterStore } from '../../store/characterStore'
import { useCampaign } from '../../hooks/useCampaign'
import { db } from '../../db/index'
import { generateId } from '../../lib/ids'
import { now, formatDisplay } from '../../lib/dates'
import type { SessionNote } from '../../types/session'
import { CharacterCard } from './CharacterCard'
import { PartyHealthPanel } from './PartyHealthPanel'
import { InitiativeTrackerPanel } from './InitiativeTrackerPanel'
import { CreateCharacterSheet } from './CreateCharacterSheet'

// ── Session notes helpers ─────────────────────────────────────────────────────

interface NoteFormState {
  id: string | null
  title: string
  sessionLabel: string
  body: string
}

function emptyNoteForm(): NoteFormState {
  return { id: null, title: '', body: '', sessionLabel: '' }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CharacterListView() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const openSearch = useUIStore((state) => state.openSearch)

  // Campaign
  const { campaign, setActiveCampaign } = useCampaign()

  // Characters
  const characters = useCharacterStore((state) => state.characters)
  const loadCharacters = useCharacterStore((state) => state.loadCharacters)

  // Session notes
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([])
  const [isNotesExpanded, setIsNotesExpanded] = useState(false)
  const [noteSheetOpen, setNoteSheetOpen] = useState(false)
  const [noteForm, setNoteForm] = useState<NoteFormState>(emptyNoteForm())

  // Character sheet
  const [isCharSheetOpen, setIsCharSheetOpen] = useState(false)

  // Loading state
  const [isLoading, setIsLoading] = useState(true)

  // ── Mount ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!campaignId) return

    setActiveCampaign(campaignId)

    Promise.all([
      loadCharacters(campaignId),
      db.sessionNotes.where('campaignId').equals(campaignId).toArray(),
    ])
      .then(([, notes]) => {
        setSessionNotes(notes.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
      })
      .finally(() => setIsLoading(false))
  }, [campaignId, setActiveCampaign, loadCharacters])

  // ── Session note actions ───────────────────────────────────────────────────

  function openNewNote() {
    setNoteForm(emptyNoteForm())
    setNoteSheetOpen(true)
  }

  function openEditNote(note: SessionNote) {
    setNoteForm({
      id: note.id,
      title: note.title,
      sessionLabel: note.sessionLabel ?? '',
      body: note.body,
    })
    setNoteSheetOpen(true)
  }

  async function handleSaveNote() {
    if (!campaignId || !noteForm.title.trim()) return

    const timestamp = now()

    if (noteForm.id) {
      // Update existing
      const updated: SessionNote = {
        id: noteForm.id,
        campaignId,
        title: noteForm.title.trim(),
        body: noteForm.body,
        tags: [],
        sessionLabel: noteForm.sessionLabel.trim() || undefined,
        createdAt:
          sessionNotes.find((n) => n.id === noteForm.id)?.createdAt ?? timestamp,
        updatedAt: timestamp,
      }
      await db.sessionNotes.put(updated)
      setSessionNotes((prev) =>
        prev.map((n) => (n.id === updated.id ? updated : n))
      )
    } else {
      // Create new
      const created: SessionNote = {
        id: generateId(),
        campaignId,
        title: noteForm.title.trim(),
        body: noteForm.body,
        tags: [],
        sessionLabel: noteForm.sessionLabel.trim() || undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      await db.sessionNotes.add(created)
      setSessionNotes((prev) => [created, ...prev])
    }

    setNoteSheetOpen(false)
    setNoteForm(emptyNoteForm())
  }

  // ── Derived data ───────────────────────────────────────────────────────────

  const characterList = Object.values(characters).filter(
    (c) => c.campaignId === campaignId
  )

  // ── Actions bar ───────────────────────────────────────────────────────────

  const searchButton = (
    <button
      type="button"
      onClick={openSearch}
      aria-label="Open search"
      className="inline-flex items-center justify-center w-10 h-10 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
        />
      </svg>
    </button>
  )

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!campaignId) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full py-20">
          <p className="text-slate-500">Campaign not found.</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="flex flex-col h-full">
        <PageHeader
          title={campaign?.name ?? 'Campaign'}
          subtitle={campaign?.system}
          onBack={() => navigate('/')}
          actions={searchButton}
        />

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {/* Party health */}
              <PartyHealthPanel characters={characterList} />

              {/* Initiative tracker */}
              <InitiativeTrackerPanel campaignId={campaignId} />

              {/* Session Notes */}
              <div className="bg-slate-800 rounded-xl overflow-hidden mb-4">
                <button
                  type="button"
                  onClick={() => setIsNotesExpanded((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-700/50 transition-colors"
                  aria-expanded={isNotesExpanded}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-300">Session Notes</span>
                    {sessionNotes.length > 0 && (
                      <Badge variant="default" size="sm">
                        {sessionNotes.length}
                      </Badge>
                    )}
                  </div>
                  <span className="text-slate-400 text-sm select-none">
                    {isNotesExpanded ? '▲' : '▼'}
                  </span>
                </button>

                {isNotesExpanded && (
                  <div className="border-t border-slate-700">
                    {sessionNotes.length === 0 ? (
                      <p className="text-slate-500 text-sm px-4 py-3">
                        No session notes yet.
                      </p>
                    ) : (
                      <div className="divide-y divide-slate-700">
                        {sessionNotes.map((note) => (
                          <button
                            key={note.id}
                            type="button"
                            onClick={() => openEditNote(note)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700/50 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-100 truncate">
                                {note.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {formatDisplay(note.updatedAt)}
                              </p>
                            </div>
                            {note.sessionLabel && (
                              <Badge variant="indigo" size="sm">
                                {note.sessionLabel}
                              </Badge>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="px-4 py-2 border-t border-slate-700">
                      <button
                        type="button"
                        onClick={openNewNote}
                        className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                      >
                        + Add Note
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Characters list */}
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
                  My Characters
                </h2>

                {characterList.length === 0 ? (
                  <EmptyState
                    title="No characters yet"
                    description="Add your first character to this campaign"
                    action={
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsCharSheetOpen(true)}
                      >
                        Add Character
                      </Button>
                    }
                  />
                ) : (
                  <div className="flex flex-col gap-2">
                    {characterList.map((character) => (
                      <CharacterCard
                        key={character.id}
                        character={character}
                        isOwner={true}
                        onClick={() =>
                          navigate(
                            `/campaigns/${campaignId}/characters/${character.id}`
                          )
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* FAB */}
        <button
          type="button"
          onClick={() => setIsCharSheetOpen(true)}
          aria-label="Add character"
          className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shadow-lg z-30"
        >
          +
        </button>

        {/* Create character sheet */}
        <CreateCharacterSheet
          isOpen={isCharSheetOpen}
          onClose={() => setIsCharSheetOpen(false)}
          campaignId={campaignId}
        />

        {/* Session note sheet */}
        <BottomSheet
          isOpen={noteSheetOpen}
          onClose={() => {
            setNoteSheetOpen(false)
            setNoteForm(emptyNoteForm())
          }}
          title={noteForm.id ? 'Edit Note' : 'New Session Note'}
        >
          <div className="flex flex-col gap-4">
            {/* Title */}
            <div className="w-full">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={noteForm.title}
                onChange={(e) =>
                  setNoteForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Session title"
                className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 focus:outline-none text-slate-100 placeholder:text-slate-500 rounded-lg px-3 py-2 transition-colors"
                autoFocus
              />
            </div>

            {/* Session label */}
            <div className="w-full">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Session Label
              </label>
              <input
                type="text"
                value={noteForm.sessionLabel}
                onChange={(e) =>
                  setNoteForm((f) => ({ ...f, sessionLabel: e.target.value }))
                }
                placeholder="e.g. Session 1, One-Shot"
                className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 focus:outline-none text-slate-100 placeholder:text-slate-500 rounded-lg px-3 py-2 transition-colors"
              />
            </div>

            {/* Body */}
            <div className="w-full">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Notes
              </label>
              <MarkdownEditor
                value={noteForm.body}
                onChange={(v) => setNoteForm((f) => ({ ...f, body: v }))}
                placeholder="Write session notes in Markdown..."
                rows={8}
              />
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={handleSaveNote}
              disabled={!noteForm.title.trim()}
            >
              {noteForm.id ? 'Save Note' : 'Create Note'}
            </Button>
          </div>
        </BottomSheet>

        <SearchOverlay />
      </div>
    </AppShell>
  )
}
