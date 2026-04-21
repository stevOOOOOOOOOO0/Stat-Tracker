import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCharacterStore } from '../../store/characterStore'
import { useCampaign } from '../../hooks/useCampaign'
import { useConditions } from '../../hooks/useConditions'
import { useRestActions } from '../../hooks/useRestActions'
import { useExport } from '../../hooks/useExport'
import { useUIStore } from '../../store/uiStore'
import { useCharacter } from '../../hooks/useCharacter'
import { AppShell } from '../../components/layout/AppShell'
import { PageHeader } from '../../components/layout/PageHeader'
import { BottomSheet } from '../../components/overlays/BottomSheet'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { NumberStepper } from '../../components/ui/NumberStepper'
import { IconButton } from '../../components/ui/IconButton'
import { SearchOverlay } from '../../components/overlays/SearchOverlay'
import { ConditionChipBar } from './conditions/ConditionChipBar'
import { StatsTab } from './tabs/StatsTab'
import { ItemsTab } from './tabs/ItemsTab'
import { AbilitiesTab } from './tabs/AbilitiesTab'
import { BiographyTab } from './tabs/BiographyTab'
import { StatEditSheet } from './stats/StatEditSheet'
import { CreateStatBlockSheet } from './stats/CreateStatBlockSheet'
import { ItemEditSheet } from './items/ItemEditSheet'
import { AbilityEditSheet } from './abilities/AbilityEditSheet'
import { NoteEditSheet } from './biography/NoteEditSheet'
import { HistoryLog } from './biography/HistoryLog'
import type { RestAction, RestReset, RestResetMode, HistoryEntryType } from '../../types'
import { generateId } from '../../lib/ids'
import { now, formatRelative } from '../../lib/dates'

// ─── Section wrappers ────────────────────────────────────────────────────────

interface SectionProps {
  title: string
  children: React.ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="border-b border-slate-800">
      <div className="px-4 py-3 bg-slate-900 sticky top-0 z-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          {title}
        </span>
      </div>
      <div className="px-2 pb-3">{children}</div>
    </div>
  )
}

const HISTORY_ICONS: Record<HistoryEntryType, string> = {
  stat_change: '📊', rest: '💤', level_up: '⭐', item_used: '⚔️',
  ability_used: '✨', condition_change: '🎭', currency_change: '💰', manual: '📝',
}

interface HistorySectionProps {
  history: import('../../types').HistoryEntry[]
  characterId: string
}

function HistorySection({ history, characterId }: HistorySectionProps) {
  const [open, setOpen] = useState(false)
  const latest = history[history.length - 1]
  return (
    <div className="border-b border-slate-800">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-900 sticky top-0 z-10"
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">History</span>
        <span className="text-slate-500 text-sm" style={{ transform: open ? 'rotate(180deg)' : undefined, display: 'inline-block' }}>▼</span>
      </button>
      {!open && latest && (
        <div className="px-4 py-2 flex gap-3 border-t border-slate-800/60">
          <span className="text-base flex-shrink-0 mt-0.5">{HISTORY_ICONS[latest.type] ?? '📝'}</span>
          <div className="flex-1 min-w-0">
            <p className="text-slate-400 text-sm truncate">{latest.description}</p>
            <p className="text-slate-600 text-xs">{formatRelative(latest.timestamp)}</p>
          </div>
        </div>
      )}
      {open && <div className="px-2 pb-3"><HistoryLog history={history} characterId={characterId} /></div>}
    </div>
  )
}

// ─── Create type picker ──────────────────────────────────────────────────────

type CreateType = 'stat-block' | 'stat' | 'item' | 'ability' | 'bio-section' | 'note'

const CREATE_OPTIONS: { type: CreateType; label: string; icon: string; description: string }[] = [
  { type: 'stat-block', label: 'Stat Block',      icon: '📋', description: 'A named group of stats' },
  { type: 'stat',       label: 'Stat',            icon: '📊', description: 'HP, Strength, AC…' },
  { type: 'item',       label: 'Item',            icon: '⚔️',  description: 'Weapon, potion, gear…' },
  { type: 'ability',    label: 'Ability',         icon: '✨', description: 'Spell, skill, feature…' },
  { type: 'bio-section',label: 'Biography Section',icon: '📖', description: 'Backstory, traits…' },
  { type: 'note',       label: 'Note',            icon: '📝', description: 'Session notes, reminders…' },
]

// ─── Rest form ───────────────────────────────────────────────────────────────

interface NewRestActionForm {
  name: string
  resetStatId: string
  resetMode: RestResetMode
  resetAmount: number
}

function emptyRestForm(): NewRestActionForm {
  return { name: '', resetStatId: '', resetMode: 'full', resetAmount: 0 }
}

// ─── Main view ───────────────────────────────────────────────────────────────

export default function CharacterSheetView() {
  const { campaignId, characterId } = useParams<{ campaignId: string; characterId: string }>()
  const navigate = useNavigate()

  const setActiveCharacter = useCharacterStore((s) => s.setActiveCharacter)
  const loadCharacters    = useCharacterStore((s) => s.loadCharacters)
  const characters        = useCharacterStore((s) => s.characters)
  const updateCharacter   = useCharacterStore((s) => s.updateCharacter)
  const addStatBlock      = useCharacterStore((s) => s.addStatBlock)

  const { character }                        = useCharacter()
  const { campaign, setActiveCampaign }      = useCampaign()
  const { conditionLibrary, appliedConditions } = useConditions()
  const { restActions, triggerRest }         = useRestActions()
  const { exportCharacter }                  = useExport()
  const openSearch                           = useUIStore((s) => s.openSearch)

  // Sheet states
  const [isCreatePickerOpen, setIsCreatePickerOpen]         = useState(false)
  const [isRestSheetOpen,     setIsRestSheetOpen]           = useState(false)
  const [isAddRestFormOpen,   setIsAddRestFormOpen]         = useState(false)
  const [addRestForm,         setAddRestForm]               = useState<NewRestActionForm>(emptyRestForm())

  // Creation sub-sheet states
  const [createStatBlockOpen, setCreateStatBlockOpen]       = useState(false)
  const [createStatOpen,      setCreateStatOpen]            = useState(false)
  const [createStatBlockId,   setCreateStatBlockId]         = useState('')
  const [createItemOpen,      setCreateItemOpen]            = useState(false)
  const [createAbilityOpen,   setCreateAbilityOpen]         = useState(false)
  const [createNoteOpen,      setCreateNoteOpen]            = useState(false)

  useEffect(() => {
    if (!characterId || !campaignId) return
    setActiveCharacter(characterId)
    setActiveCampaign(campaignId)
    const hasCharacters = Object.values(characters).some((c) => c.campaignId === campaignId)
    if (!hasCharacters) loadCharacters(campaignId)
  }, [characterId, campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!characterId || !campaignId) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full py-20">
          <p className="text-slate-500">Character not found.</p>
        </div>
      </AppShell>
    )
  }

  // ── Create picker handler ──
  const handleCreatePick = (type: CreateType) => {
    setIsCreatePickerOpen(false)
    if (type === 'stat-block') {
      setCreateStatBlockOpen(true)
    } else if (type === 'stat') {
      // Ensure there's at least one stat block to add to
      if (!character || character.statBlocks.length === 0) {
        const blockId = generateId()
        addStatBlock(characterId, {
          id: blockId,
          characterId,
          name: 'General',
          order: 0,
          statIds: [],
        })
        setCreateStatBlockId(blockId)
      } else {
        setCreateStatBlockId(character.statBlocks[0].id)
      }
      setCreateStatOpen(true)
    } else if (type === 'item') {
      setCreateItemOpen(true)
    } else if (type === 'ability') {
      setCreateAbilityOpen(true)
    } else if (type === 'bio-section') {
      // Add a biography section directly
      if (character) {
        const sections = character.biography?.sections ?? []
        updateCharacter(characterId, {
          biography: {
            characterId,
            sections: [
              ...sections,
              { id: generateId(), title: 'New Section', body: '', order: sections.length },
            ],
          },
        })
      }
    } else if (type === 'note') {
      setCreateNoteOpen(true)
    }
  }

  // ── Rest action handler ──
  const handleAddRestAction = () => {
    if (!addRestForm.name.trim() || !character) return
    const resets: RestReset[] = addRestForm.resetStatId
      ? [{ statId: addRestForm.resetStatId, mode: addRestForm.resetMode,
           amount: addRestForm.resetMode !== 'full' ? addRestForm.resetAmount : undefined }]
      : []
    const newRest: RestAction = {
      id: generateId(), characterId, name: addRestForm.name.trim(), resets,
    }
    updateCharacter(characterId, { restActions: [...(character.restActions ?? []), newRest] })
    setAddRestForm(emptyRestForm())
    setIsAddRestFormOpen(false)
  }

  const statOptions = character
    ? [{ value: '', label: '— No stat —' },
       ...character.stats
         .filter((s) => s.category === 'resource' || s.category === 'base')
         .map((s) => ({ value: s.id, label: s.name }))]
    : [{ value: '', label: '— No stat —' }]

  const resetModeOptions = [
    { value: 'full',  label: 'Full restore' },
    { value: 'fixed', label: 'Fixed amount' },
    { value: 'roll',  label: 'Roll formula' },
  ]

  return (
    <AppShell>
      <div className="flex flex-col h-screen overflow-hidden">

        {/* ── Header ── */}
        <PageHeader
          title={character?.name ?? 'Loading...'}
          subtitle={character
            ? `Level ${character.level}${campaign?.system ? ` · ${campaign.system}` : ''}`
            : undefined}
          onBack={() => navigate(`/campaigns/${campaignId}`)}
          actions={
            <>
              <IconButton icon={<span>🔍</span>} label="Search"   variant="ghost" size="sm" onClick={openSearch} />
              <IconButton icon={<span>⬇</span>}  label="Export"   variant="ghost" size="sm" onClick={exportCharacter} />
              <IconButton icon={<span>💤</span>}  label="Rest"     variant="ghost" size="sm" onClick={() => setIsRestSheetOpen(true)} />
            </>
          }
        />

        {/* ── Condition chips ── */}
        {character && (
          <ConditionChipBar applied={appliedConditions} conditions={conditionLibrary} characterId={characterId} />
        )}

        {/* ── Single scrollable sheet ── */}
        <div className="flex-1 overflow-y-auto pb-24">

          {character && (character.statBlocks.length > 0 || character.stats.length > 0) && (
            <Section title="Stats">
              <StatsTab />
            </Section>
          )}

          {character && (character.items.length > 0 || character.currency.length > 0) && (
            <Section title="Items & Currency">
              <ItemsTab />
            </Section>
          )}

          {character && character.abilities.length > 0 && (
            <Section title="Abilities">
              <AbilitiesTab />
            </Section>
          )}

          {character && (
            (character.biography?.sections?.length ?? 0) > 0 ||
            character.notes.length > 0
          ) && (
            <Section title="Biography & Notes">
              <BiographyTab />
            </Section>
          )}

          {character && character.history.length > 0 && (
            <HistorySection history={character.history} characterId={characterId} />
          )}

        </div>

        {/* ── Create FAB ── */}
        <button
          type="button"
          onClick={() => setIsCreatePickerOpen(true)}
          aria-label="Create new"
          className="fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-lg flex items-center justify-center text-white text-2xl font-light"
        >
          +
        </button>

        {/* ── Create picker sheet ── */}
        <BottomSheet isOpen={isCreatePickerOpen} onClose={() => setIsCreatePickerOpen(false)} title="Create New">
          <div className="grid grid-cols-2 gap-3 pb-4">
            {CREATE_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={() => handleCreatePick(opt.type)}
                className="flex flex-col items-center gap-2 bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all rounded-xl p-4 text-center"
              >
                <span className="text-3xl">{opt.icon}</span>
                <span className="text-sm font-semibold text-slate-100">{opt.label}</span>
                <span className="text-xs text-slate-400">{opt.description}</span>
              </button>
            ))}
          </div>
        </BottomSheet>

        {/* ── Creation sub-sheets ── */}
        <CreateStatBlockSheet
          isOpen={createStatBlockOpen}
          onClose={() => setCreateStatBlockOpen(false)}
          characterId={characterId}
        />

        {createStatBlockId && (
          <StatEditSheet
            stat={null}
            blockId={createStatBlockId}
            isOpen={createStatOpen}
            onClose={() => setCreateStatOpen(false)}
            stats={character?.stats ?? []}
            characterId={characterId}
          />
        )}

        <ItemEditSheet
          item={null}
          isOpen={createItemOpen}
          onClose={() => setCreateItemOpen(false)}
          characterId={characterId}
          stats={character?.stats ?? []}
        />

        <AbilityEditSheet
          ability={null}
          isOpen={createAbilityOpen}
          onClose={() => setCreateAbilityOpen(false)}
          characterId={characterId}
          stats={character?.stats ?? []}
        />

        <NoteEditSheet
          note={null}
          isOpen={createNoteOpen}
          onClose={() => setCreateNoteOpen(false)}
          characterId={characterId}
        />

        {/* ── Rest sheet ── */}
        <BottomSheet
          isOpen={isRestSheetOpen}
          onClose={() => { setIsRestSheetOpen(false); setIsAddRestFormOpen(false); setAddRestForm(emptyRestForm()) }}
          title="Rest Actions"
        >
          <div className="flex flex-col gap-3 pb-4">
            {restActions.length === 0 && !isAddRestFormOpen && (
              <p className="text-slate-500 text-sm">No rest actions defined. Add one below.</p>
            )}
            {restActions.map((ra) => (
              <Button key={ra.id} variant="secondary" fullWidth
                onClick={() => { triggerRest(ra, conditionLibrary); setIsRestSheetOpen(false) }}>
                {ra.name}
              </Button>
            ))}

            {!isAddRestFormOpen ? (
              <Button variant="ghost" size="sm" onClick={() => setIsAddRestFormOpen(true)}>
                + Add Rest Action
              </Button>
            ) : (
              <div className="flex flex-col gap-3 bg-slate-700/40 rounded-xl p-3">
                <p className="text-sm font-semibold text-slate-300">New Rest Action</p>
                <Input label="Name" value={addRestForm.name} placeholder="e.g. Short Rest"
                  onChange={(e) => setAddRestForm((f) => ({ ...f, name: e.target.value }))} />
                <Select label="Stat to reset" value={addRestForm.resetStatId} options={statOptions}
                  onChange={(e) => setAddRestForm((f) => ({ ...f, resetStatId: e.target.value }))} />
                {addRestForm.resetStatId && (
                  <Select label="Reset mode" value={addRestForm.resetMode} options={resetModeOptions}
                    onChange={(e) => setAddRestForm((f) => ({ ...f, resetMode: e.target.value as RestResetMode }))} />
                )}
                {addRestForm.resetStatId && addRestForm.resetMode === 'fixed' && (
                  <div className="flex flex-col items-center">
                    <NumberStepper value={addRestForm.resetAmount} min={0} label="Amount" size="sm"
                      onChange={(v) => setAddRestForm((f) => ({ ...f, resetAmount: v }))} />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" disabled={!addRestForm.name.trim()} onClick={handleAddRestAction}>Save</Button>
                  <Button variant="ghost"   size="sm" onClick={() => { setIsAddRestFormOpen(false); setAddRestForm(emptyRestForm()) }}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        </BottomSheet>

        <SearchOverlay />
      </div>
    </AppShell>
  )
}
