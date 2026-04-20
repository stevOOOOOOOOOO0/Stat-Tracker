import React from 'react'
import type { Condition, AppliedCondition } from '../../../types'

export interface ConditionBadgeProps {
  condition: Condition
  applied: AppliedCondition
  onRemove: () => void
}

const SEVERE_CONDITIONS = [
  'Paralyzed',
  'Unconscious',
  'Stunned',
  'Petrified',
  'Incapacitated',
]

const CAUTION_CONDITIONS = [
  'Poisoned',
  'Frightened',
  'Charmed',
  'Blinded',
  'Deafened',
  'Exhausted',
]

function getColorClasses(name: string): string {
  if (SEVERE_CONDITIONS.includes(name)) {
    return 'bg-red-900/60 text-red-300'
  }
  if (CAUTION_CONDITIONS.includes(name)) {
    return 'bg-yellow-900/60 text-yellow-300'
  }
  return 'bg-slate-700 text-slate-300'
}

export function ConditionBadge({ condition, applied, onRemove }: ConditionBadgeProps) {
  const colorClasses = getColorClasses(condition.name)

  const label =
    condition.durationType === 'rounds' && applied.remainingRounds !== undefined
      ? `${condition.name} (${applied.remainingRounds})`
      : condition.name

  return (
    <span
      className={[
        'text-sm px-2 py-0.5 rounded-full inline-flex items-center gap-1 flex-shrink-0',
        colorClasses,
      ].join(' ')}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="opacity-60 hover:opacity-100 ml-1 leading-none transition-opacity"
        aria-label={`Remove ${condition.name}`}
      >
        ×
      </button>
    </span>
  )
}
