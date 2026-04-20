import { create } from 'zustand'
import type { Stat } from '../types/stat'
import type { RollResult } from '../engine/rollEvaluator'
import { evaluateRoll } from '../engine/rollEvaluator'
import { now } from '../lib/dates'

const MAX_HISTORY = 20

interface DiceHistoryEntry {
  formula: string
  result: RollResult
  timestamp: string
}

interface DiceState {
  formula: string
  history: DiceHistoryEntry[]

  setFormula: (f: string) => void
  rollFormula: (stats?: Stat[]) => RollResult
  rollQuick: (sides: number) => RollResult
}

export const useDiceStore = create<DiceState>((set, get) => ({
  formula: '',
  history: [],

  setFormula: (f) => set({ formula: f }),

  rollFormula: (stats = []) => {
    const { formula } = get()
    const result = evaluateRoll(formula, stats)
    const entry: DiceHistoryEntry = {
      formula,
      result,
      timestamp: now(),
    }
    set(state => ({
      history: [entry, ...state.history].slice(0, MAX_HISTORY),
    }))
    return result
  },

  rollQuick: (sides) => {
    const formula = `1d${sides}`
    const result = evaluateRoll(formula, [])
    const entry: DiceHistoryEntry = {
      formula,
      result,
      timestamp: now(),
    }
    set(state => ({
      history: [entry, ...state.history].slice(0, MAX_HISTORY),
    }))
    return result
  },
}))
