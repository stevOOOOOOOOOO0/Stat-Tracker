import React, { useState, useEffect } from 'react'
import type { Ability, Stat, RollExpression } from '../../../types'
import { BottomSheet } from '../../../components/overlays/BottomSheet'
import { ConfirmDialog } from '../../../components/overlays/ConfirmDialog'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Textarea } from '../../../components/ui/Textarea'
import { Toggle } from '../../../components/ui/Toggle'
import { NumberStepper } from '../../../components/ui/NumberStepper'
import { Select } from '../../../components/ui/Select'
import { RollExpressionEditor } from '../../../components/shared/RollExpressionEditor'
import { AffectorSelector } from '../../../components/shared/AffectorSelector'
import { useCharacterStore } from '../../../store/characterStore'
import { generateId } from '../../../lib/ids'
import { PreparedToggle } from './PreparedToggle'

export interface AbilityEditSheetProps {
  ability: Ability | null
  isOpen: boolean
  onClose: () => void
  characterId: string
  stats: Stat[]
}

function buildDefaultAbility(characterId: string, order: number): Ability {
  return {
    id: generateId(),
    characterId,
    name: '',
    description: '',
    rollExpressions: [],
    affectorIds: [],
    prepared: true,
    order,
  }
}

export function AbilityEditSheet({ ability, isOpen, onClose, characterId, stats }: AbilityEditSheetProps) {
  const addAbility = useCharacterStore(s => s.addAbility)
  const updateAbility = useCharacterStore(s => s.updateAbility)
  const removeAbility = useCharacterStore(s => s.removeAbility)
  const characters = useCharacterStore(s => s.characters)

  const [draft, setDraft] = useState<Ability | null>(null)
  const [hasResourceCost, setHasResourceCost] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const resourceStats = stats.filter(s => s.category === 'resource')

  useEffect(() => {
    if (!isOpen) return
    if (ability) {
      setDraft({ ...ability })
      setHasResourceCost(
        ability.resourceCostStatId !== undefined && ability.resourceCostStatId !== ''
      )
    } else {
      const character = characters[characterId]
      const order = character ? character.abilities.length : 0
      setDraft(buildDefaultAbility(characterId, order))
      setHasResourceCost(false)
    }
  }, [isOpen, ability])

  const updateDraft = (updates: Partial<Ability>) => {
    setDraft(prev => prev ? { ...prev, ...updates } : prev)
  }

  const handleSave = () => {
    if (!draft || !draft.name.trim()) return
    const finalDraft: Ability = {
      ...draft,
      name: draft.name.trim(),
      resourceCostStatId: hasResourceCost ? draft.resourceCostStatId : undefined,
      resourceCostAmount: hasResourceCost ? draft.resourceCostAmount : undefined,
    }
    if (ability) {
      updateAbility(characterId, finalDraft)
    } else {
      addAbility(characterId, finalDraft)
    }
    onClose()
  }

  const handleDelete = () => {
    if (!ability) return
    removeAbility(characterId, ability.id)
    setConfirmDelete(false)
    onClose()
  }

  const title = ability ? 'Edit Ability' : 'New Ability'

  if (!draft) return null

  const resourceStatOptions = [
    { value: '', label: '— Select stat —' },
    ...resourceStats.map(s => ({ value: s.id, label: s.name })),
  ]

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
        <div className="space-y-4">
          <Input
            label="Name"
            value={draft.name}
            onChange={e => updateDraft({ name: e.target.value })}
            placeholder="Ability name"
            required
          />

          {/* Prepared toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300">Status</span>
            <PreparedToggle
              prepared={draft.prepared}
              onChange={v => updateDraft({ prepared: v })}
            />
          </div>

          <Textarea
            label="Description (optional)"
            value={draft.description ?? ''}
            onChange={e => updateDraft({ description: e.target.value })}
            placeholder="Describe this ability..."
            rows={3}
          />

          {/* Roll expressions */}
          <div>
            <p className="text-sm font-medium text-slate-300 mb-2">Roll Expressions</p>
            <RollExpressionEditor
              expressions={draft.rollExpressions}
              onChange={exprs => updateDraft({ rollExpressions: exprs as RollExpression[] })}
              stats={stats}
            />
          </div>

          {/* Affectors */}
          <AffectorSelector
            value={draft.affectorIds}
            onChange={ids => updateDraft({ affectorIds: ids })}
            stats={stats}
            label="Affected By Stats"
          />

          {/* Resource cost */}
          <div className="space-y-2">
            <Toggle
              checked={hasResourceCost}
              onChange={v => {
                setHasResourceCost(v)
                if (!v) {
                  updateDraft({ resourceCostStatId: undefined, resourceCostAmount: undefined })
                } else if (!draft.resourceCostStatId && resourceStats.length > 0) {
                  updateDraft({ resourceCostStatId: resourceStats[0].id, resourceCostAmount: 1 })
                }
              }}
              label="Has resource cost"
            />
            {hasResourceCost && (
              <div className="space-y-2 pl-2 border-l-2 border-slate-600">
                <Select
                  label="Resource Stat"
                  options={resourceStatOptions}
                  value={draft.resourceCostStatId ?? ''}
                  onChange={e => updateDraft({ resourceCostStatId: e.target.value || undefined })}
                />
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-300">Amount</span>
                  <NumberStepper
                    value={draft.resourceCostAmount ?? 1}
                    onChange={v => updateDraft({ resourceCostAmount: v })}
                    min={1}
                    size="sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Recharge condition */}
          <Input
            label="Recharge Condition (optional)"
            value={draft.rechargeCondition ?? ''}
            onChange={e => updateDraft({ rechargeCondition: e.target.value || undefined })}
            placeholder="e.g. Long rest, Short rest"
          />

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {ability && (
              <Button
                variant="danger"
                size="sm"
                type="button"
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="button"
              onClick={handleSave}
              disabled={!draft.name.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      </BottomSheet>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Ability"
        description={`Are you sure you want to delete "${ability?.name}"?`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </>
  )
}
