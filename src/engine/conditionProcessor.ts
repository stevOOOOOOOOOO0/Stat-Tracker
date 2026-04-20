import type { Stat } from '../types/stat'
import type { AppliedCondition, Condition } from '../types/condition'
import { evaluateFormula } from './formulaEngine'

/**
 * Returns a new stats array with condition modifiers overlaid.
 * Does NOT mutate the input. Returns new Stat objects for modified stats.
 */
export function applyConditionAffectors(
  stats: Stat[],
  appliedConditions: AppliedCondition[],
  conditionLibrary: Condition[]
): Stat[] {
  // Build a lookup for conditions
  const conditionMap = new Map<string, Condition>(
    conditionLibrary.map(c => [c.id, c])
  )

  // Start with copies of all stats
  const statsMap = new Map<string, Stat>(
    stats.map(s => [s.id, { ...s }])
  )

  for (const applied of appliedConditions) {
    const condition = conditionMap.get(applied.conditionId)
    if (!condition || !condition.affectorRules) continue

    for (const rule of condition.affectorRules) {
      const stat = statsMap.get(rule.statId)
      if (!stat) continue

      const updatedStat = { ...stat }

      if (typeof rule.modifier === 'number') {
        // Add numeric modifier to the stat's value
        if (typeof updatedStat.value === 'number') {
          updatedStat.value = updatedStat.value + rule.modifier
        }
        if (updatedStat.currentValue !== undefined) {
          updatedStat.currentValue = updatedStat.currentValue + rule.modifier
        }
      } else if (typeof rule.modifier === 'string') {
        // Evaluate the modifier formula using current stats
        const currentStats = Array.from(statsMap.values())
        const result = evaluateFormula(rule.modifier, currentStats)
        if (!result.error) {
          if (typeof updatedStat.value === 'number') {
            updatedStat.value = updatedStat.value + result.value
          }
          if (updatedStat.currentValue !== undefined) {
            updatedStat.currentValue = updatedStat.currentValue + result.value
          }
        }
      }

      statsMap.set(rule.statId, updatedStat)
    }
  }

  return Array.from(statsMap.values())
}
