import { useState, useEffect } from 'react'
import { useCharacterStore } from '../store/characterStore'
import { evaluateFormula, type FormulaResult } from '../engine/formulaEngine'

/**
 * Evaluates a formula against the active character's effective stats.
 * Debounced 300ms.
 */
export function useFormulaEval(formula: string): FormulaResult {
  const activeCharacterId = useCharacterStore(state => state.activeCharacterId)
  const effectiveStatsMap = useCharacterStore(state => state.effectiveStats)

  const effectiveStats = activeCharacterId
    ? effectiveStatsMap[activeCharacterId] ?? []
    : []

  const [result, setResult] = useState<FormulaResult>({ value: 0 })

  useEffect(() => {
    if (!formula.trim()) {
      setResult({ value: 0 })
      return
    }

    const timer = setTimeout(() => {
      const evaluated = evaluateFormula(formula, effectiveStats)
      setResult(evaluated)
    }, 300)

    return () => clearTimeout(timer)
  }, [formula, effectiveStats])

  return result
}
