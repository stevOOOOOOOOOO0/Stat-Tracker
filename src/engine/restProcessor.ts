import type { Character } from '../types/character'
import type { RestAction } from '../types/rest'
import type { Stat } from '../types/stat'
import { evaluateFormula } from './formulaEngine'

/**
 * Applies a rest action to a character's stats.
 * Returns a new stats array with resets applied.
 * Does NOT mutate the input arrays.
 */
export function applyRestAction(
  character: Character,
  restAction: RestAction
): Stat[] {
  const statsMap = new Map<string, Stat>(character.stats.map(s => [s.id, { ...s }]))

  for (const reset of restAction.resets) {
    const stat = statsMap.get(reset.statId)
    if (!stat) continue

    const updatedStat = { ...stat }

    // Parse max value to a number
    const resolveMax = (): number => {
      if (updatedStat.maxValue === undefined) return Infinity
      if (typeof updatedStat.maxValue === 'number') return updatedStat.maxValue
      const result = evaluateFormula(String(updatedStat.maxValue), character.stats)
      return result.error ? Infinity : result.value
    }

    switch (reset.mode) {
      case 'full': {
        const maxVal = resolveMax()
        updatedStat.currentValue = maxVal === Infinity ? (updatedStat.currentValue ?? 0) : maxVal
        break
      }

      case 'fixed': {
        const amount = reset.amount ?? 0
        const maxVal = resolveMax()
        const current = updatedStat.currentValue ?? 0
        updatedStat.currentValue = maxVal === Infinity
          ? current + amount
          : Math.min(current + amount, maxVal)
        break
      }

      case 'roll': {
        if (reset.formula) {
          const result = evaluateFormula(reset.formula, character.stats)
          const rollAmount = result.error ? 0 : result.value
          const maxVal = resolveMax()
          const current = updatedStat.currentValue ?? 0
          updatedStat.currentValue = maxVal === Infinity
            ? current + rollAmount
            : Math.min(current + rollAmount, maxVal)
        }
        break
      }
    }

    statsMap.set(reset.statId, updatedStat)
  }

  return Array.from(statsMap.values())
}
