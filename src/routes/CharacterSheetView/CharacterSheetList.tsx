import React, { useState, useEffect, useRef } from 'react'
import type { Stat, Item, Ability, Note, BiographySection, Character } from '../../types'
import { useCharacterStore } from '../../store/characterStore'
import { SortableList } from '../../components/shared/SortableList'
import { ConfirmDialog } from '../../components/overlays/ConfirmDialog'
import { StatRow } from './stats/StatRow'
import { StatPopover } from './stats/StatPopover'
import { StatEditSheet } from './stats/StatEditSheet'
import { ItemCard } from './items/ItemCard'
import { ItemEditSheet } from './items/ItemEditSheet'
import { AbilityCard } from './abilities/AbilityCard'
import { AbilityEditSheet } from './abilities/AbilityEditSheet'
import { NoteCard } from './biography/NoteCard'
import { NoteEditSheet } from './biography/NoteEditSheet'
import { BiographySectionEditor } from './biography/BiographySectionEditor'

type SheetEntry =
  | { kind: 'stat'; id: string; data: Stat }
  | { kind: 'item'; id: string; data: Item }
  | { kind: 'ability'; id: string; data: Ability }
  | { kind: 'note'; id: string; data: Note }
  | { kind: 'bio-section'; id: string; data: BiographySection }

interface ActiveRoll { statId: string; result: number; diceTotal: number }

const TYPE_PRIORITY: Record<SheetEntry['kind'], number> = {
  stat: 0, item: 1, ability: 2, 'bio-section': 3, note: 4,
}

function buildEntries(character: Character): SheetEntry[] {
  const all: SheetEntry[] = [
    ...character.stats.map(d => ({ kind: 'stat' as const, id: d.id, data: d })),
    ...character.items.map(d => ({ kind: 'item' as const, id: d.id, data: d })),
    ...character.abilities.map(d => ({ kind: 'ability' as const, id: d.id, data: d })),
    ...(character.biography?.sections ?? []).map(d => ({ kind: 'bio-section' as const, id: d.id, data: d })),
    ...character.notes.map(d => ({ kind: 'note' as const, id: d.id, data: d })),
  ]

  const orderMap = new Map((character.sheetOrder ?? []).map((id, i) => [id, i]))

  return [...all].sort((a, b) => {
    const oa = orderMap.get(a.id)
    const ob = orderMap.get(b.id)
    if (oa !== undefined && ob !== undefined) return oa - ob
    if (oa !== undefined) return -1
    if (ob !== undefined) return 1
    const pa = TYPE_PRIORITY[a.kind], pb = TYPE_PRIORITY[b.kind]
    if (pa !== pb) return pa - pb
    return (a.data as { order: number }).order - (b.data as { order: number }).order
  })
}

export interface CharacterSheetListProps {
  character: Character
  characterId: string
}

export function CharacterSheetList({ character, characterId }: CharacterSheetListProps) {
  const updateCharacter = useCharacterStore(s => s.updateCharacter)
  const removeItem      = useCharacterStore(s => s.removeItem)
  const removeAbility   = useCharacterStore(s => s.removeAbility)
  const updateBiography = useCharacterStore(s => s.updateBiography)

  const [activeStatId,          setActiveStatId]          = useState<string | null>(null)
  const [editingStat,           setEditingStat]           = useState<Stat | null | undefined>(undefined)
  const [activeRoll,            setActiveRoll]            = useState<ActiveRoll | null>(null)
  const [editingItem,           setEditingItem]           = useState<Item | null | undefined>(undefined)
  const [confirmDeleteItemId,   setConfirmDeleteItemId]   = useState<string | null>(null)
  const [editingAbility,        setEditingAbility]        = useState<Ability | null | undefined>(undefined)
  const [confirmDeleteAbilityId,setConfirmDeleteAbilityId]= useState<string | null>(null)
  const [editingNote,           setEditingNote]           = useState<Note | null>(null)

  const rollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (rollTimerRef.current) clearTimeout(rollTimerRef.current) }, [])

  const handleRoll = (statId: string, result: number, diceTotal: number) => {
    if (rollTimerRef.current) clearTimeout(rollTimerRef.current)
    setActiveRoll({ statId, result, diceTotal })
    rollTimerRef.current = setTimeout(() => setActiveRoll(null), 30_000)
  }

  const handleDismissRoll = () => {
    if (rollTimerRef.current) clearTimeout(rollTimerRef.current)
    setActiveRoll(null)
  }

  const allStats = character.stats
  const entries  = buildEntries(character)

  const handleReorder = (newEntries: SheetEntry[]) => {
    updateCharacter(characterId, { sheetOrder: newEntries.map(e => e.id) })
  }

  return (
    <div className="p-2">
      <SortableList
        items={entries}
        keyExtractor={e => e.id}
        onReorder={handleReorder}
        renderItem={(entry, _idx, dragHandleProps) => {
          switch (entry.kind) {
            case 'stat':
              return (
                <StatRow
                  key={entry.id}
                  stat={entry.data}
                  allStats={allStats}
                  onOpen={() => setActiveStatId(entry.id)}
                  onRoll={handleRoll}
                  rollResult={activeRoll?.statId === entry.id ? activeRoll.result : null}
                  diceTotal={activeRoll?.statId === entry.id ? activeRoll.diceTotal : null}
                  onDismissRoll={handleDismissRoll}
                  dragHandleProps={dragHandleProps}
                />
              )
            case 'item':
              return (
                <ItemCard
                  key={entry.id}
                  item={entry.data}
                  onEdit={() => setEditingItem(entry.data)}
                  onDelete={() => setConfirmDeleteItemId(entry.id)}
                  dragHandleProps={dragHandleProps}
                />
              )
            case 'ability':
              return (
                <AbilityCard
                  key={entry.id}
                  ability={entry.data}
                  onEdit={() => setEditingAbility(entry.data)}
                  onDelete={() => setConfirmDeleteAbilityId(entry.id)}
                  dragHandleProps={dragHandleProps}
                />
              )
            case 'note':
              return (
                <NoteCard
                  key={entry.id}
                  note={entry.data}
                  onEdit={() => setEditingNote(entry.data)}
                  onDelete={() => setEditingNote(entry.data)}
                  dragHandleProps={dragHandleProps}
                />
              )
            case 'bio-section':
              return (
                <BiographySectionEditor
                  key={entry.id}
                  section={entry.data}
                  onUpdate={updated => {
                    const sections = (character.biography?.sections ?? []).map(s =>
                      s.id === updated.id ? updated : s
                    )
                    updateBiography(characterId, { ...character.biography, sections })
                  }}
                  onDelete={() => {
                    const sections = (character.biography?.sections ?? [])
                      .filter(s => s.id !== entry.id)
                      .map((s, i) => ({ ...s, order: i }))
                    updateBiography(characterId, { ...character.biography, sections })
                  }}
                  dragHandleProps={dragHandleProps}
                />
              )
          }
        }}
      />

      {activeStatId !== null && (() => {
        const activeStat = allStats.find(s => s.id === activeStatId)
        return activeStat ? (
          <StatPopover
            stat={activeStat}
            allStats={allStats}
            characterId={characterId}
            onClose={() => setActiveStatId(null)}
            onEdit={() => { setActiveStatId(null); setEditingStat(activeStat) }}
            onRoll={handleRoll}
            onDismissRoll={handleDismissRoll}
            rollResult={activeRoll?.statId === activeStatId ? activeRoll.result : null}
            diceTotal={activeRoll?.statId === activeStatId ? activeRoll.diceTotal : null}
          />
        ) : null
      })()}

      {editingStat !== undefined && (
        <StatEditSheet
          stat={editingStat ?? null}
          isOpen={true}
          onClose={() => setEditingStat(undefined)}
          stats={character.stats}
          items={character.items}
          abilities={character.abilities}
          characterId={characterId}
        />
      )}

      {editingItem !== undefined && (
        <ItemEditSheet
          item={editingItem ?? null}
          isOpen={true}
          onClose={() => setEditingItem(undefined)}
          characterId={characterId}
          allStats={character.stats}
        />
      )}

      {editingAbility !== undefined && (
        <AbilityEditSheet
          ability={editingAbility ?? null}
          isOpen={true}
          onClose={() => setEditingAbility(undefined)}
          characterId={characterId}
          allStats={character.stats}
        />
      )}

      <NoteEditSheet
        note={editingNote}
        isOpen={editingNote !== null}
        onClose={() => setEditingNote(null)}
        characterId={characterId}
      />

      <ConfirmDialog
        isOpen={confirmDeleteItemId !== null}
        onClose={() => setConfirmDeleteItemId(null)}
        onConfirm={() => { removeItem(characterId, confirmDeleteItemId!); setConfirmDeleteItemId(null) }}
        title="Delete Item"
        description={`Delete "${character.items.find(i => i.id === confirmDeleteItemId)?.name}"?`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />

      <ConfirmDialog
        isOpen={confirmDeleteAbilityId !== null}
        onClose={() => setConfirmDeleteAbilityId(null)}
        onConfirm={() => { removeAbility(characterId, confirmDeleteAbilityId!); setConfirmDeleteAbilityId(null) }}
        title="Delete Ability"
        description={`Delete "${character.abilities.find(a => a.id === confirmDeleteAbilityId)?.name}"?`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  )
}
