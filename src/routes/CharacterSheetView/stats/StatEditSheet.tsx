import React, { useState, useEffect } from 'react'
import type { Stat, DiceType, AffectTarget, AffecteeEntry } from '../../../types'
import { AFFECT_TARGET_LABELS } from '../../../types'
import type { Item } from '../../../types'
import type { Ability } from '../../../types'
import { BottomSheet } from '../../../components/overlays/BottomSheet'
import { ConfirmDialog } from '../../../components/overlays/ConfirmDialog'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { useCharacterStore } from '../../../store/characterStore'
import { generateId } from '../../../lib/ids'

const DICE_TYPES: DiceType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100']

export interface StatEditSheetProps {
  stat: Stat | null
  isOpen: boolean
  onClose: () => void
  stats: Stat[]
  items: Item[]
  abilities: Ability[]
  characterId: string
}

function Toggle({ checked, onChange, label, description }: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-300">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ${checked ? 'bg-indigo-600' : 'bg-slate-600'}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ml-0.5 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  )
}

export function StatEditSheet({ stat, isOpen, onClose, stats, items, abilities, characterId }: StatEditSheetProps) {
  const addStat    = useCharacterStore(s => s.addStat)
  const updateStat = useCharacterStore(s => s.updateStat)
  const removeStat = useCharacterStore(s => s.removeStat)

  const [name, setName]               = useState('')
  const [baseValue, setBaseValue]     = useState('0')
  const [minValue, setMinValue]       = useState('')
  const [hasMin, setHasMin]           = useState(false)
  const [maxValue, setMaxValue]       = useState('')
  const [hasMax, setHasMax]           = useState(false)
  const [isRollable, setIsRollable]   = useState(false)
  const [diceCount, setDiceCount]     = useState('1')
  const [diceType, setDiceType]       = useState<DiceType>('d20')
  // affectorEntries: stats that affect this stat (stored on each affector stat's .affectees)
  const [affectorEntries, setAffectorEntries] = useState<{ statId: string; target: AffectTarget }[]>([])
  const [affectees, setAffectees]             = useState<AffecteeEntry[]>([])
  const [confirmDelete, setConfirmDelete]     = useState(false)
  const [showAffectorPicker, setShowAffectorPicker] = useState(false)
  const [affectorPendingId, setAffectorPendingId]   = useState<string | null>(null)
  const [showAffecteePicker, setShowAffecteePicker] = useState(false)
  const [affecteePendingId, setAffecteePendingId]   = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    if (stat) {
      setName(stat.name)
      setBaseValue(String(stat.baseValue))
      setHasMin(stat.minValue !== undefined)
      setMinValue(stat.minValue !== undefined ? String(stat.minValue) : '')
      setHasMax(stat.maxValue !== undefined)
      setMaxValue(stat.maxValue !== undefined ? String(stat.maxValue) : '')
      setIsRollable(stat.isRollable)
      setDiceCount(String(stat.diceCount))
      setDiceType(stat.diceType)
      // Affectors = stats that currently list this stat in their .affectees
      setAffectorEntries(
        stats.flatMap(s =>
          (s.affectees ?? [])
            .filter(e => e.id === stat.id)
            .map(e => ({ statId: s.id, target: e.target }))
        )
      )
      setAffectees([...(stat.affectees ?? [])])
    } else {
      setName('')
      setBaseValue('0')
      setMinValue('0')
      setHasMin(false)
      setMinValue('')
      setHasMax(false)
      setMaxValue('')
      setIsRollable(false)
      setDiceCount('1')
      setDiceType('d20')
      setAffectorEntries([])
      setAffectees([])
    }
    setShowAffectorPicker(false)
    setAffectorPendingId(null)
    setShowAffecteePicker(false)
    setAffecteePendingId(null)
    setConfirmDelete(false)
  }, [isOpen, stat])  // eslint-disable-line react-hooks/exhaustive-deps

  const canSave = name.trim().length > 0

  const handleSave = () => {
    if (!canSave) return
    const next: Stat = {
      id:          stat?.id ?? generateId(),
      name:        name.trim(),
      baseValue:   parseFloat(baseValue) || 0,
      minValue:    hasMin ? (isNaN(parseFloat(minValue)) ? 0 : parseFloat(minValue)) : undefined,
      maxValue:    hasMax ? (isNaN(parseFloat(maxValue)) ? 0 : parseFloat(maxValue)) : undefined,
      isRollable,
      diceCount:   Math.max(1, parseInt(diceCount) || 1),
      diceType,
      affectees,
      order:       stat?.order ?? stats.length,
    }
    if (stat) updateStat(characterId, next, affectorEntries)
    else      addStat(characterId, next, affectorEntries)
    onClose()
  }

  const handleDelete = () => {
    if (!stat) return
    removeStat(characterId, stat.id)
    setConfirmDelete(false)
    onClose()
  }

  // Picker options — exclude already-selected entries and self
  const affectorPickerOptions = stats.filter(s => s.id !== stat?.id && !affectorEntries.some(e => e.statId === s.id))

  const affecteeOptions: { id: string; label: string; sourceType: 'stat' | 'item' | 'ability' }[] = [
    ...stats.filter(s => s.id !== stat?.id && !affectees.some(e => e.id === s.id)).map(s => ({ id: s.id, label: s.name, sourceType: 'stat' as const })),
    ...items.filter(i => !affectees.some(e => e.id === i.id)).map(i => ({ id: i.id, label: i.name, sourceType: 'item' as const })),
    ...abilities.filter(a => !affectees.some(e => e.id === a.id)).map(a => ({ id: a.id, label: a.name, sourceType: 'ability' as const })),
  ]

  const footer = (
    <div className="flex gap-3">
      {stat && (
        <Button variant="danger" size="sm" type="button" onClick={() => setConfirmDelete(true)}>
          Delete
        </Button>
      )}
      <div className="flex-1" />
      <Button variant="ghost" size="sm" type="button" onClick={onClose}>
        Discard
      </Button>
      <Button variant="primary" size="sm" type="button" onClick={handleSave} disabled={!canSave}>
        Save
      </Button>
    </div>
  )

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title={stat ? 'Edit Stat' : 'New Stat'} footer={footer}>
        <div className="space-y-5">
          {/* Name */}
          <Input
            label="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. HP, Strength, AC"
            required
            autoFocus
          />

          {/* Base Value */}
          <Input
            label="Base Value"
            type="number"
            value={baseValue}
            onChange={e => setBaseValue(e.target.value)}
          />

          {/* Min / Max */}
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-300">Minimum</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={hasMin}
                  onClick={() => setHasMin(v => !v)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors ${hasMin ? 'bg-indigo-600' : 'bg-slate-600'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5 ml-0.5 ${hasMin ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
              {hasMin && (
                <input
                  type="number"
                  value={minValue}
                  onChange={e => setMinValue(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-300">Maximum</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={hasMax}
                  onClick={() => setHasMax(v => !v)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors ${hasMax ? 'bg-indigo-600' : 'bg-slate-600'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5 ml-0.5 ${hasMax ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
              {hasMax && (
                <input
                  type="number"
                  value={maxValue}
                  onChange={e => setMaxValue(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>
          </div>

          {/* Rollable toggle */}
          <Toggle
            checked={isRollable}
            onChange={setIsRollable}
            label="Rollable"
            description="Players roll dice and add this stat's value for checks"
          />

          {/* Dice config */}
          {isRollable && (
            <div className="flex gap-3">
              <div className="w-24">
                <Input
                  label="# Dice"
                  type="number"
                  value={diceCount}
                  onChange={e => setDiceCount(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-300 mb-1">Dice Type</label>
                <select
                  value={diceType}
                  onChange={e => setDiceType(e.target.value as DiceType)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {DICE_TYPES.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Affectors */}
          <div>
            <p className="text-sm font-medium text-slate-300 mb-2">Affected By</p>
            {affectorEntries.length > 0 && (
              <div className="space-y-1 mb-2">
                {affectorEntries.map(entry => {
                  const s = stats.find(x => x.id === entry.statId)
                  if (!s) return null
                  return (
                    <div key={entry.statId} className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2">
                      <span className="text-xs text-slate-500 uppercase tracking-wide flex-shrink-0">stat</span>
                      <span className="flex-1 text-slate-300 text-sm truncate">{s.name}</span>
                      <span className="text-xs text-indigo-400 flex-shrink-0">→ {AFFECT_TARGET_LABELS[entry.target]}</span>
                      <button
                        type="button"
                        onClick={() => setAffectorEntries(prev => prev.filter(e => e.statId !== entry.statId))}
                        className="text-slate-500 hover:text-red-400 transition-colors text-xl leading-none flex-shrink-0"
                        aria-label={`Remove ${s.name}`}
                      >×</button>
                    </div>
                  )
                })}
              </div>
            )}

            {showAffectorPicker ? (
              <div className="border border-slate-600 rounded-lg overflow-hidden">
                {affectorPendingId === null ? (
                  <div className="max-h-52 overflow-y-auto">
                    <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide bg-slate-800/60">Stats</p>
                    {affectorPickerOptions.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-slate-500 italic">No stats available.</p>
                    ) : (
                      affectorPickerOptions.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setAffectorPendingId(s.id)}
                          className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700/60 transition-colors"
                        >
                          {s.name}
                        </button>
                      ))
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide bg-slate-800/60">
                      Affects which field?
                    </p>
                    {(['baseValue', 'minValue', 'maxValue'] as AffectTarget[]).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setAffectorEntries(prev => [...prev, { statId: affectorPendingId, target: t }])
                          setAffectorPendingId(null)
                          setShowAffectorPicker(false)
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700/60 transition-colors"
                      >
                        {AFFECT_TARGET_LABELS[t]}
                      </button>
                    ))}
                  </div>
                )}
                <div className="border-t border-slate-700/50 p-2">
                  <Button variant="ghost" size="sm" type="button" onClick={() => { setAffectorPendingId(null); setShowAffectorPicker(false) }}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="ghost" size="sm" type="button" onClick={() => setShowAffectorPicker(true)}>
                + Add
              </Button>
            )}
          </div>

          {/* Affectees */}
          <div>
            <p className="text-sm font-medium text-slate-300 mb-2">Affecting</p>
            {affectees.length > 0 && (
              <div className="space-y-1 mb-2">
                {affectees.map(entry => {
                  const entity =
                    stats.find(s => s.id === entry.id) ??
                    items.find(i => i.id === entry.id) ??
                    abilities.find(a => a.id === entry.id)
                  const typeLabel = stats.find(s => s.id === entry.id) ? 'stat'
                    : items.find(i => i.id === entry.id) ? 'item' : 'ability'
                  if (!entity) return null
                  return (
                    <div key={entry.id} className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2">
                      <span className="text-xs text-slate-500 uppercase tracking-wide flex-shrink-0">{typeLabel}</span>
                      <span className="flex-1 text-slate-300 text-sm truncate">{entity.name}</span>
                      {typeLabel === 'stat' && (
                        <span className="text-xs text-indigo-400 flex-shrink-0">→ {AFFECT_TARGET_LABELS[entry.target]}</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setAffectees(prev => prev.filter(e => e.id !== entry.id))}
                        className="text-slate-500 hover:text-red-400 transition-colors text-xl leading-none flex-shrink-0"
                        aria-label={`Remove ${entity.name}`}
                      >×</button>
                    </div>
                  )
                })}
              </div>
            )}

            {showAffecteePicker ? (
              <div className="border border-slate-600 rounded-lg overflow-hidden">
                {affecteePendingId === null ? (
                  <div className="max-h-52 overflow-y-auto">
                    {(['stat', 'item', 'ability'] as const).map(type => {
                      const opts = affecteeOptions.filter(o => o.sourceType === type)
                      const labels: Record<string, string> = { stat: 'Stats', item: 'Items', ability: 'Abilities' }
                      return (
                        <div key={type}>
                          <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide bg-slate-800/60">
                            {labels[type]}
                          </p>
                          {opts.length === 0 ? (
                            <p className="px-3 py-2 text-xs text-slate-500 italic">No {labels[type].toLowerCase()} added yet.</p>
                          ) : (
                            opts.map(opt => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  if (opt.sourceType === 'stat') {
                                    setAffecteePendingId(opt.id)
                                  } else {
                                    setAffectees(prev => [...prev, { id: opt.id, target: 'baseValue' }])
                                    setShowAffecteePicker(false)
                                  }
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700/60 transition-colors"
                              >
                                {opt.label}
                              </button>
                            ))
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div>
                    <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide bg-slate-800/60">
                      Affects which field?
                    </p>
                    {(['baseValue', 'minValue', 'maxValue'] as AffectTarget[]).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setAffectees(prev => [...prev, { id: affecteePendingId, target: t }])
                          setAffecteePendingId(null)
                          setShowAffecteePicker(false)
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700/60 transition-colors"
                      >
                        {AFFECT_TARGET_LABELS[t]}
                      </button>
                    ))}
                  </div>
                )}
                <div className="border-t border-slate-700/50 p-2">
                  <Button variant="ghost" size="sm" type="button" onClick={() => { setAffecteePendingId(null); setShowAffecteePicker(false) }}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="ghost" size="sm" type="button" onClick={() => setShowAffecteePicker(true)}>
                + Add
              </Button>
            )}
          </div>

        </div>
      </BottomSheet>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Stat"
        description={`Delete "${stat?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </>
  )
}
