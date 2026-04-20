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
import { TabBar } from '../../components/layout/TabBar'
import { XpBar } from '../../components/shared/XpBar'
import { BottomSheet } from '../../components/overlays/BottomSheet'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { NumberStepper } from '../../components/ui/NumberStepper'
import { IconButton } from '../../components/ui/IconButton'
import { SearchOverlay } from '../../components/overlays/SearchOverlay'
import { ConditionChipBar } from './conditions/ConditionChipBar'
import { QuickAccessBar } from './QuickAccessBar'
import { StatsTab } from './tabs/StatsTab'
import { ItemsTab } from './tabs/ItemsTab'
import { AbilitiesTab } from './tabs/AbilitiesTab'
import { BiographyTab } from './tabs/BiographyTab'
import type { RestAction, RestReset, RestResetMode } from '../../types'
import { generateId } from '../../lib/ids'

const TABS = [
  { label: 'Stats' },
  { label: 'Items & Currency' },
  { label: 'Abilities' },
  { label: 'Biography & Notes' },
]

interface NewRestActionForm {
  name: string
  resetStatId: string
  resetMode: RestResetMode
  resetAmount: number
}

function emptyRestForm(): NewRestActionForm {
  return {
    name: '',
    resetStatId: '',
    resetMode: 'full',
    resetAmount: 0,
  }
}

export default function CharacterSheetView() {
  const { campaignId, characterId } = useParams<{
    campaignId: string
    characterId: string
  }>()
  const navigate = useNavigate()

  // Store actions
  const setActiveCharacter = useCharacterStore((s) => s.setActiveCharacter)
  const loadCharacters = useCharacterStore((s) => s.loadCharacters)
  const characters = useCharacterStore((s) => s.characters)
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)

  // Hooks
  const { character } = useCharacter()
  const { campaign, setActiveCampaign } = useCampaign()
  const { conditionLibrary, appliedConditions } = useConditions()
  const { restActions, triggerRest } = useRestActions()
  const { exportCharacter } = useExport()
  const openSearch = useUIStore((s) => s.openSearch)

  // Local state
  const [activeTab, setActiveTab] = useState(0)
  const [isRestSheetOpen, setIsRestSheetOpen] = useState(false)
  const [addRestForm, setAddRestForm] = useState<NewRestActionForm>(emptyRestForm())
  const [isAddRestFormOpen, setIsAddRestFormOpen] = useState(false)

  // Mount: activate character and load campaign data
  useEffect(() => {
    if (!characterId || !campaignId) return
    setActiveCharacter(characterId)
    setActiveCampaign(campaignId)
    // Load characters if not yet loaded for this campaign
    const hasCharacters = Object.values(characters).some(
      (c) => c.campaignId === campaignId
    )
    if (!hasCharacters) {
      loadCharacters(campaignId)
    }
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

  const handleAddRestAction = () => {
    if (!addRestForm.name.trim() || !character) return

    const resets: RestReset[] = addRestForm.resetStatId
      ? [
          {
            statId: addRestForm.resetStatId,
            mode: addRestForm.resetMode,
            amount:
              addRestForm.resetMode !== 'full' ? addRestForm.resetAmount : undefined,
          },
        ]
      : []

    const newRestAction: RestAction = {
      id: generateId(),
      characterId,
      name: addRestForm.name.trim(),
      resets,
    }

    updateCharacter(characterId, {
      restActions: [...(character.restActions ?? []), newRestAction],
    })

    setAddRestForm(emptyRestForm())
    setIsAddRestFormOpen(false)
  }

  const headerActions = (
    <>
      <IconButton
        icon={<span className="text-base leading-none">🔍</span>}
        label="Search"
        variant="ghost"
        size="sm"
        onClick={openSearch}
      />
      <IconButton
        icon={<span className="text-base leading-none">⬇</span>}
        label="Export character"
        variant="ghost"
        size="sm"
        onClick={exportCharacter}
      />
      <IconButton
        icon={<span className="text-base leading-none">💤</span>}
        label="Rest"
        variant="ghost"
        size="sm"
        onClick={() => setIsRestSheetOpen(true)}
      />
    </>
  )

  const resetModeOptions = [
    { value: 'full', label: 'Full restore' },
    { value: 'fixed', label: 'Fixed amount' },
    { value: 'roll', label: 'Roll formula' },
  ]

  const statOptions = character
    ? [
        { value: '', label: '— No stat —' },
        ...character.stats
          .filter((s) => s.category === 'resource' || s.category === 'base')
          .map((s) => ({ value: s.id, label: s.name })),
      ]
    : [{ value: '', label: '— No stat —' }]

  return (
    <AppShell>
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <PageHeader
          title={character?.name ?? 'Loading...'}
          subtitle={
            character
              ? `Level ${character.level}${campaign?.system ? ` · ${campaign.system}` : ''}`
              : undefined
          }
          onBack={() => navigate(`/campaigns/${campaignId}`)}
          actions={headerActions}
        />

        {/* XP bar */}
        {character && (
          <div className="px-3 py-2 bg-slate-900 border-b border-slate-800">
            <XpBar
              currentXp={character.currentXp}
              threshold={character.xpThreshold}
              level={character.level}
            />
          </div>
        )}

        {/* Condition chip bar */}
        {character && (
          <ConditionChipBar
            applied={appliedConditions}
            conditions={conditionLibrary}
            characterId={characterId}
          />
        )}

        {/* Quick access bar */}
        {character && <QuickAccessBar characterId={characterId} />}

        {/* Tab bar */}
        <TabBar
          tabs={TABS}
          activeIndex={activeTab}
          onChange={setActiveTab}
        />

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 0 && <StatsTab />}
          {activeTab === 1 && <ItemsTab />}
          {activeTab === 2 && <AbilitiesTab />}
          {activeTab === 3 && <BiographyTab />}
        </div>

        {/* Rest actions sheet */}
        <BottomSheet
          isOpen={isRestSheetOpen}
          onClose={() => {
            setIsRestSheetOpen(false)
            setIsAddRestFormOpen(false)
            setAddRestForm(emptyRestForm())
          }}
          title="Rest Actions"
        >
          <div className="flex flex-col gap-3 pb-4">
            {restActions.length === 0 && !isAddRestFormOpen ? (
              <p className="text-slate-500 text-sm">
                No rest actions defined. Add one below.
              </p>
            ) : (
              restActions.map((ra) => (
                <Button
                  key={ra.id}
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    triggerRest(ra, conditionLibrary)
                    setIsRestSheetOpen(false)
                  }}
                >
                  {ra.name}
                </Button>
              ))
            )}

            {/* Add rest action toggle */}
            {!isAddRestFormOpen ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddRestFormOpen(true)}
              >
                + Add Rest Action
              </Button>
            ) : (
              <div className="flex flex-col gap-3 bg-slate-700/40 rounded-xl p-3">
                <p className="text-sm font-semibold text-slate-300">New Rest Action</p>

                <Input
                  label="Name"
                  value={addRestForm.name}
                  onChange={(e) =>
                    setAddRestForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Short Rest"
                />

                <Select
                  label="Stat to reset"
                  value={addRestForm.resetStatId}
                  onChange={(e) =>
                    setAddRestForm((f) => ({ ...f, resetStatId: e.target.value }))
                  }
                  options={statOptions}
                />

                {addRestForm.resetStatId && (
                  <Select
                    label="Reset mode"
                    value={addRestForm.resetMode}
                    onChange={(e) =>
                      setAddRestForm((f) => ({
                        ...f,
                        resetMode: e.target.value as RestResetMode,
                      }))
                    }
                    options={resetModeOptions}
                  />
                )}

                {addRestForm.resetStatId && addRestForm.resetMode === 'fixed' && (
                  <div className="flex flex-col items-center">
                    <NumberStepper
                      value={addRestForm.resetAmount}
                      onChange={(v) =>
                        setAddRestForm((f) => ({ ...f, resetAmount: v }))
                      }
                      min={0}
                      label="Amount"
                      size="sm"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddRestAction}
                    disabled={!addRestForm.name.trim()}
                  >
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAddRestFormOpen(false)
                      setAddRestForm(emptyRestForm())
                    }}
                  >
                    Cancel
                  </Button>
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
