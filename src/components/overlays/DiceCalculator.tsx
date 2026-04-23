import React, { useState } from 'react'
import { FormulaInput } from '../ui/FormulaInput'
import { Button } from '../ui/Button'
import { useDice } from '../../hooks/useDice'
import type { Stat } from '../../types'
import type { RollResult } from '../../engine/rollEvaluator'

const DICE = [
  { label: 'd4', sides: 4 },
  { label: 'd6', sides: 6 },
  { label: 'd8', sides: 8 },
  { label: 'd10', sides: 10 },
  { label: 'd12', sides: 12 },
  { label: 'd20', sides: 20 },
  { label: 'd%', sides: 100 },
]

function DiceBreakdown({ formula, result }: { formula: string; result: RollResult }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  const toggle = (i: number) => setRevealed(prev => {
    const next = new Set(prev)
    next.has(i) ? next.delete(i) : next.add(i)
    return next
  })

  // Split formula into dice tokens and plain text segments
  const segments: Array<{ type: 'dice'; notation: string; idx: number } | { type: 'text'; value: string }> = []
  let rollIdx = 0, lastEnd = 0
  for (const m of formula.matchAll(/\d+d\d+/gi)) {
    if (m.index! > lastEnd) segments.push({ type: 'text', value: formula.slice(lastEnd, m.index) })
    segments.push({ type: 'dice', notation: m[0], idx: rollIdx++ })
    lastEnd = m.index! + m[0].length
  }
  if (lastEnd < formula.length) segments.push({ type: 'text', value: formula.slice(lastEnd) })

  return (
    <div className="flex items-center flex-wrap gap-x-1 gap-y-0.5">
      {segments.map((seg, i) =>
        seg.type === 'text' ? (
          <span key={i} className="text-xs text-slate-500">{seg.value.trim()}</span>
        ) : (
          <button
            key={i}
            type="button"
            onClick={() => toggle(seg.idx)}
            className={`text-xs font-mono tabular-nums px-1.5 py-0.5 rounded transition-colors ${
              revealed.has(seg.idx)
                ? 'bg-indigo-600/30 text-indigo-300'
                : 'bg-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={revealed.has(seg.idx) ? 'Show notation' : 'Show result'}
          >
            {revealed.has(seg.idx) ? (result.rolls[seg.idx]?.result ?? seg.notation) : seg.notation}
          </button>
        )
      )}
      <span className="text-xs text-slate-500">= </span>
      <span className="text-indigo-300 font-bold tabular-nums">{result.total}</span>
    </div>
  )
}

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
          <div className="mt-3">
            <DiceBreakdown formula={lastEntry.formula} result={lastEntry.result} />
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
                <DiceBreakdown formula={entry.formula} result={entry.result} />
                <span className="text-slate-500 text-xs flex-shrink-0 ml-2">
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
