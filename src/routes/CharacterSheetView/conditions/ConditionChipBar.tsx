import React, { useState } from 'react'
import type { AppliedCondition, Condition } from '../../../types'
import { useConditions } from '../../../hooks/useConditions'
import { ConditionBadge } from './ConditionBadge'
import { ConditionPicker } from './ConditionPicker'

export interface ConditionChipBarProps {
  applied: AppliedCondition[]
  conditions: Condition[]
  characterId: string
}

export function ConditionChipBar({
  applied,
  conditions,
  characterId,
}: ConditionChipBarProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const { removeCondition } = useConditions()

  return (
    <>
      <div className="flex gap-2 px-3 py-2 overflow-x-auto scrollbar-none items-center bg-slate-900 border-b border-slate-800">
        {applied.length === 0 && (
          <span className="text-slate-600 text-sm">No conditions</span>
        )}

        {applied.map((ac) => {
          const condition = conditions.find((c) => c.id === ac.conditionId)
          if (!condition) {
            // Render a fallback badge for custom/unknown conditions
            return (
              <span
                key={ac.conditionId}
                className="text-sm px-2 py-0.5 rounded-full inline-flex items-center gap-1 flex-shrink-0 bg-slate-700 text-slate-300"
              >
                {ac.conditionId.slice(0, 12)}
                <button
                  type="button"
                  onClick={() => removeCondition(ac.conditionId)}
                  className="opacity-60 hover:opacity-100 ml-1 leading-none"
                  aria-label="Remove condition"
                >
                  ×
                </button>
              </span>
            )
          }
          return (
            <ConditionBadge
              key={ac.conditionId}
              condition={condition}
              applied={ac}
              onRemove={() => removeCondition(ac.conditionId)}
            />
          )
        })}

        {/* Add button */}
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-slate-100 flex items-center justify-center text-sm transition-colors"
          aria-label="Add condition"
        >
          +
        </button>
      </div>

      <ConditionPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        applied={applied}
        characterId={characterId}
      />
    </>
  )
}
