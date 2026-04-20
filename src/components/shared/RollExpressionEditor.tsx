import React from 'react'
import { Input } from '../ui/Input'
import { FormulaInput } from '../ui/FormulaInput'
import { IconButton } from '../ui/IconButton'
import { Button } from '../ui/Button'
import type { RollExpression } from '../../types/item'
import type { Stat } from '../../types'

export interface RollExpressionEditorProps {
  expressions: RollExpression[]
  onChange: (expressions: RollExpression[]) => void
  stats: Stat[]
}

export function RollExpressionEditor({
  expressions,
  onChange,
  stats,
}: RollExpressionEditorProps) {
  const updateExpression = (index: number, updates: Partial<RollExpression>) => {
    onChange(
      expressions.map((expr, i) => (i === index ? { ...expr, ...updates } : expr))
    )
  }

  const removeExpression = (index: number) => {
    onChange(expressions.filter((_, i) => i !== index))
  }

  const addExpression = () => {
    onChange([...expressions, { label: '', formula: '' }])
  }

  return (
    <div className="w-full">
      {expressions.map((expr, i) => (
        <div key={i} className="flex gap-2 items-start mb-3">
          <div className="flex-1">
            <Input
              placeholder="Label"
              value={expr.label}
              onChange={(e) => updateExpression(i, { label: e.target.value })}
            />
          </div>
          <div className="flex-[2]">
            <FormulaInput
              value={expr.formula}
              onChange={(v) => updateExpression(i, { formula: v })}
              stats={stats}
              placeholder="Formula"
            />
          </div>
          <div className="pt-0.5">
            <IconButton
              icon={
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              }
              label="Delete roll expression"
              variant="danger"
              size="sm"
              onClick={() => removeExpression(i)}
            />
          </div>
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={addExpression} type="button">
        + Add Roll
      </Button>
    </div>
  )
}
