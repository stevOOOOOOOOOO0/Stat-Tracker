import React, { useState } from 'react'
import type { AppliedCondition } from '../../../types'
import { useConditions } from '../../../hooks/useConditions'
import { BottomSheet } from '../../../components/overlays/BottomSheet'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { generateId } from '../../../lib/ids'
import { now } from '../../../lib/dates'

export interface ConditionPickerProps {
  isOpen: boolean
  onClose: () => void
  applied: AppliedCondition[]
  characterId: string
}

export function ConditionPicker({
  isOpen,
  onClose,
  applied,
  characterId,
}: ConditionPickerProps) {
  const { conditionLibrary, applyCondition, removeCondition } = useConditions()
  const [search, setSearch] = useState('')
  const [customName, setCustomName] = useState('')

  const filteredConditions = conditionLibrary.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const isApplied = (conditionId: string) =>
    applied.some((ac) => ac.conditionId === conditionId)

  const handleToggle = (conditionId: string) => {
    if (isApplied(conditionId)) {
      removeCondition(conditionId)
    } else {
      const appliedCondition: AppliedCondition = {
        conditionId,
        characterId,
        appliedAt: now(),
      }
      applyCondition(appliedCondition)
    }
  }

  const handleApplyCustom = () => {
    const name = customName.trim()
    if (!name) return

    const id = generateId()
    // Apply directly with the custom id (condition won't be in library, but that's ok)
    const appliedCondition: AppliedCondition = {
      conditionId: id,
      characterId,
      appliedAt: now(),
    }
    applyCondition(appliedCondition)
    setCustomName('')
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Conditions">
      {/* Search */}
      <div className="mb-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conditions..."
        />
      </div>

      {/* Condition list */}
      <div className="space-y-1 mb-4 max-h-72 overflow-y-auto">
        {filteredConditions.length === 0 ? (
          <p className="text-slate-500 text-sm py-2 text-center">
            No conditions found.
          </p>
        ) : (
          filteredConditions.map((condition) => {
            const checked = isApplied(condition.id)
            return (
              <label
                key={condition.id}
                className="flex items-center justify-between gap-3 px-2 py-2.5 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">
                    {condition.name}
                  </p>
                  {condition.description && (
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">
                      {condition.description}
                    </p>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleToggle(condition.id)}
                  className="w-4 h-4 accent-indigo-500 flex-shrink-0"
                />
              </label>
            )
          })
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-700 my-3" />

      {/* Custom condition */}
      <div>
        <p className="text-sm font-semibold text-slate-400 mb-2">
          Custom Condition
        </p>
        <div className="flex gap-2">
          <Input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Condition name..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleApplyCustom()
            }}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleApplyCustom}
            disabled={!customName.trim()}
            className="flex-shrink-0"
          >
            Apply
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
