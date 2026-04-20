import React from 'react'
import { FormulaInput } from '../ui/FormulaInput'
import { Button } from '../ui/Button'
import { useDice } from '../../hooks/useDice'
import type { Stat } from '../../types'

const DICE = [
  { label: 'd4', sides: 4 },
  { label: 'd6', sides: 6 },
  { label: 'd8', sides: 8 },
  { label: 'd10', sides: 10 },
  { label: 'd12', sides: 12 },
  { label: 'd20', sides: 20 },
  { label: 'd%', sides: 100 },
]

function formatTimestamp(iso: string): string {
  try {
    const date = new Date(iso)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

export interface DiceCalculatorProps {
  stats?: Stat[]
}

export function DiceCalculator({ stats = [] }: DiceCalculatorProps) {
  const { formula, history, setFormula, rollFormula, rollQuick } = useDice()

  const lastEntry = history[0] ?? null

  return (
    <div className="flex flex-col gap-5">
      {/* Quick dice grid */}
      <section>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
          Quick Roll
        </p>
        <div className="grid grid-cols-4 gap-2">
          {DICE.map(({ label, sides }) => (
            <button
              key={sides}
              type="button"
              onClick={() => rollQuick(sides)}
              className="bg-slate-700 hover:bg-indigo-700 rounded-xl py-3 text-slate-100 font-bold transition-colors min-h-[56px] text-sm"
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Formula input */}
      <section>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
          Formula Roll
        </p>
        <div className="flex flex-col gap-2">
          <FormulaInput
            value={formula}
            onChange={setFormula}
            stats={stats}
            placeholder="e.g. 2d6 + STR"
          />
          <Button
            variant="primary"
            onClick={() => rollFormula(stats)}
            disabled={!formula.trim()}
            fullWidth
          >
            Roll
          </Button>
        </div>

        {lastEntry && (
          <div className="mt-3 text-center">
            <p className="text-2xl font-bold text-indigo-400">
              {lastEntry.result.total}
            </p>
            {lastEntry.result.rolls && lastEntry.result.rolls.length > 0 && (
              <p className="text-xs text-slate-500 mt-0.5">
                [{lastEntry.result.rolls.map((r) => `${r.dice}: ${r.result}`).join(', ')}]
              </p>
            )}
          </div>
        )}
      </section>

      {/* History */}
      {history.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            History
          </p>
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            {history.slice(0, 8).map((entry, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-slate-700/50 rounded-lg px-3 py-2"
              >
                <div className="flex flex-col">
                  <span className="text-slate-400 text-xs">{entry.formula}</span>
                  <span className="text-slate-100 font-bold">{entry.result.total}</span>
                </div>
                <span className="text-slate-500 text-xs">
                  {formatTimestamp(entry.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
