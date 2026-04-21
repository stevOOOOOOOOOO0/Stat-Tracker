import React, { useState, useEffect } from 'react'
import type { Stat, StatCategory } from '../../../types'
import { BottomSheet } from '../../../components/overlays/BottomSheet'
import { ConfirmDialog } from '../../../components/overlays/ConfirmDialog'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Textarea } from '../../../components/ui/Textarea'
import { Toggle } from '../../../components/ui/Toggle'
import { NumberStepper } from '../../../components/ui/NumberStepper'
import { FormulaInput } from '../../../components/ui/FormulaInput'
import { AffectorSelector } from '../../../components/shared/AffectorSelector'
import { useCharacterStore } from '../../../store/characterStore'
import { generateId } from '../../../lib/ids'
import { buildGraph, detectCycle } from '../../../engine/affectorGraph'

export interface StatEditSheetProps {
  stat: Stat | null
  isOpen: boolean
  onClose: () => void
  stats: Stat[]
  characterId: string
}

const CATEGORIES: { value: StatCategory; label: string; desc: string }[] = [
  { value: 'base',     label: 'Base',     desc: 'A numeric attribute (e.g. Strength)' },
  { value: 'derived',  label: 'Derived',  desc: 'Computed from a formula' },
  { value: 'resource', label: 'Resource', desc: 'Tracked value with max (e.g. HP)' },
  { value: 'text',     label: 'Text',     desc: 'Free-text field (e.g. Alignment)' },
  { value: 'boolean',  label: 'Boolean',  desc: 'True / False flag' },
]

function buildDefaultStat(category: StatCategory, order: number): Stat {
  const base: Stat = {
    id: generateId(),
    name: '',
    category,
    value: category === 'boolean' ? false : category === 'text' ? '' : 0,
    order,
  }
  if (category === 'resource') return { ...base, currentValue: 0, maxValue: 0, min: 0 }
  return base
}

export function StatEditSheet({ stat, isOpen, onClose, stats, characterId }: StatEditSheetProps) {
  const addStat    = useCharacterStore(s => s.addStat)
  const updateStat = useCharacterStore(s => s.updateStat)
  const removeStat = useCharacterStore(s => s.removeStat)

  const [selectedCategory, setSelectedCategory] = useState<StatCategory | null>(stat ? stat.category : null)
  const [draft, setDraft]           = useState<Stat | null>(null)
  const [showDesc, setShowDesc]     = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [maxFormulaStr, setMaxFormulaStr] = useState('')

  useEffect(() => {
    if (!isOpen) return
    if (stat) {
      setSelectedCategory(stat.category)
      setDraft({ ...stat })
      setMaxFormulaStr(typeof stat.maxValue === 'string' ? stat.maxValue : String(stat.maxValue ?? ''))
      setShowDesc(Boolean(stat.description))
    } else {
      setSelectedCategory(null)
      setDraft(null)
      setShowDesc(false)
      setMaxFormulaStr('')
    }
  }, [isOpen, stat])

  useEffect(() => {
    if (selectedCategory && !stat) {
      setDraft(buildDefaultStat(selectedCategory, stats.length))
    }
  }, [selectedCategory]) // eslint-disable-line react-hooks/exhaustive-deps

  const cycleDetected = (() => {
    if (!draft || !draft.affectors?.length) return false
    return detectCycle(draft.affectors, draft.id, buildGraph(stats))
  })()

  const canSave = draft && draft.name.trim().length > 0 && !cycleDetected

  const handleSave = () => {
    if (!draft || !canSave) return
    let finalDraft = { ...draft }
    if (finalDraft.category === 'resource') {
      const parsed = parseFloat(maxFormulaStr)
      finalDraft = { ...finalDraft, maxValue: !isNaN(parsed) ? parsed : maxFormulaStr.trim() || 0 }
    }
    if (stat) updateStat(characterId, finalDraft)
    else addStat(characterId, finalDraft)
    onClose()
  }

  const handleDelete = () => {
    if (!stat) return
    removeStat(characterId, stat.id)
    setConfirmDelete(false)
    onClose()
  }

  const updateDraft = (updates: Partial<Stat>) =>
    setDraft(prev => prev ? { ...prev, ...updates } : prev)

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title={stat ? 'Edit Stat' : 'New Stat'}>
        {!selectedCategory ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-400 mb-4">Choose a stat category:</p>
            <div className="grid grid-cols-1 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  className="flex flex-col items-start bg-slate-700 hover:bg-slate-600 rounded-xl px-4 py-3 transition-colors text-left"
                >
                  <span className="font-semibold text-slate-100">{cat.label}</span>
                  <span className="text-xs text-slate-400 mt-0.5">{cat.desc}</span>
                </button>
              ))}
            </div>
          </div>
        ) : draft ? (
          <div className="space-y-4">
            <Input
              label="Name"
              value={draft.name}
              onChange={e => updateDraft({ name: e.target.value })}
              placeholder="Stat name"
              required
            />

            <div>
              <button
                type="button"
                onClick={() => setShowDesc(v => !v)}
                className="text-sm text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
              >
                <span>{showDesc ? '▾' : '▸'}</span>
                Description (optional)
              </button>
              {showDesc && (
                <div className="mt-2">
                  <Textarea
                    value={draft.description ?? ''}
                    onChange={e => updateDraft({ description: e.target.value })}
                    placeholder="Describe this stat..."
                    rows={3}
                  />
                </div>
              )}
            </div>

            {draft.category === 'base' && (
              <>
                <Input
                  label="Value"
                  type="number"
                  value={String(typeof draft.value === 'number' ? draft.value : 0)}
                  onChange={e => updateDraft({ value: parseFloat(e.target.value) || 0 })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Min (optional)"
                    type="number"
                    value={draft.min !== undefined ? String(draft.min) : ''}
                    onChange={e => updateDraft({ min: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="No min"
                  />
                  <Input
                    label="Max (optional)"
                    type="number"
                    value={typeof draft.max === 'number' ? String(draft.max) : ''}
                    onChange={e => updateDraft({ max: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="No max"
                  />
                </div>
                <AffectorSelector
                  value={draft.affectors ?? []}
                  onChange={ids => updateDraft({ affectors: ids })}
                  stats={stats.filter(s => s.id !== draft.id)}
                  label="Affectors (stats that affect this)"
                />
              </>
            )}

            {draft.category === 'derived' && (
              <>
                <FormulaInput
                  label="Formula"
                  value={draft.formula ?? ''}
                  onChange={v => updateDraft({ formula: v })}
                  stats={stats}
                  placeholder="e.g. floor((STR - 10) / 2)"
                />
                <AffectorSelector
                  value={draft.affectors ?? []}
                  onChange={ids => updateDraft({ affectors: ids })}
                  stats={stats.filter(s => s.id !== draft.id)}
                  label="Affectors"
                />
              </>
            )}

            {draft.category === 'resource' && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-300">Current Value</label>
                  <NumberStepper
                    value={draft.currentValue ?? 0}
                    onChange={v => updateDraft({ currentValue: v })}
                    min={draft.min ?? 0}
                  />
                </div>
                <FormulaInput
                  label="Max Value (number or formula)"
                  value={maxFormulaStr}
                  onChange={setMaxFormulaStr}
                  stats={stats}
                  placeholder="e.g. 20 or CON * 2"
                />
                <Input
                  label="Min Value"
                  type="number"
                  value={String(draft.min ?? 0)}
                  onChange={e => updateDraft({ min: parseFloat(e.target.value) || 0 })}
                />
                <AffectorSelector
                  value={draft.affectors ?? []}
                  onChange={ids => updateDraft({ affectors: ids })}
                  stats={stats.filter(s => s.id !== draft.id)}
                  label="Affectors"
                />
              </>
            )}

            {draft.category === 'text' && (
              <Input
                label="Value"
                value={typeof draft.value === 'string' ? draft.value : ''}
                onChange={e => updateDraft({ value: e.target.value })}
                placeholder="Text value"
              />
            )}

            {draft.category === 'boolean' && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-300">Default Value</span>
                <Toggle
                  checked={draft.value === true}
                  onChange={v => updateDraft({ value: v })}
                  label={draft.value === true ? 'True' : 'False'}
                />
              </div>
            )}

            {cycleDetected && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg px-3 py-2">
                <p className="text-red-400 text-sm">This would create a circular dependency.</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {stat && (
                <Button variant="danger" size="sm" type="button" onClick={() => setConfirmDelete(true)}>
                  Delete
                </Button>
              )}
              <div className="flex-1" />
              <Button variant="ghost" size="sm" type="button" onClick={onClose}>Cancel</Button>
              <Button variant="primary" size="sm" type="button" onClick={handleSave} disabled={!canSave}>
                Save
              </Button>
            </div>
          </div>
        ) : null}
      </BottomSheet>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Stat"
        description={`Are you sure you want to delete "${stat?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </>
  )
}
