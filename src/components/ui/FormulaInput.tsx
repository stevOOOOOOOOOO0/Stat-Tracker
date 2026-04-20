import React from 'react'
import { Input } from './Input'
import { evaluateFormula } from '../../engine/formulaEngine'
import type { Stat } from '../../types'

export interface FormulaInputProps {
  value: string
  onChange: (v: string) => void
  stats: Stat[]
  label?: string
  error?: string
  placeholder?: string
}

export function FormulaInput({
  value,
  onChange,
  stats,
  label,
  error,
  placeholder = 'e.g. floor((STR - 10) / 2)',
}: FormulaInputProps) {
  let evalResult: { value: number; error?: string } | null = null

  if (value.trim()) {
    evalResult = evaluateFormula(value, stats)
  }

  return (
    <div className="w-full">
      <Input
        label={label}
        error={error}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {evalResult && !error && (
        <p
          className={`text-sm mt-1 ${
            evalResult.error ? 'text-red-400' : 'text-green-400'
          }`}
        >
          {evalResult.error ? evalResult.error : `= ${evalResult.value}`}
        </p>
      )}
    </div>
  )
}
