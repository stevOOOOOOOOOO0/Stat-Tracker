import React from 'react'
import type { CurrencyDenomination } from '../../../types'
import { NumberStepper } from '../../../components/ui/NumberStepper'

export interface CurrencyDenominationRowProps {
  denom: CurrencyDenomination
  onUpdate: (amount: number) => void
  onDelete: () => void
}

export function CurrencyDenominationRow({ denom, onUpdate, onDelete }: CurrencyDenominationRowProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-slate-200 font-medium truncate">{denom.name}</span>
        {denom.abbreviation && (
          <span className="text-slate-400 text-sm">({denom.abbreviation})</span>
        )}
      </div>

      <div className="flex-1" />

      {denom.conversionToId && denom.conversionRate !== undefined && (
        <span className="text-xs text-slate-500">
          = {denom.conversionRate} {denom.conversionToId}
        </span>
      )}

      <NumberStepper
        value={denom.amount}
        onChange={onUpdate}
        min={0}
        size="sm"
      />

      <button
        type="button"
        onClick={onDelete}
        aria-label={`Remove ${denom.name}`}
        className="text-slate-500 hover:text-red-400 transition-colors text-lg w-7 h-7 flex items-center justify-center flex-shrink-0"
      >
        ×
      </button>
    </div>
  )
}
