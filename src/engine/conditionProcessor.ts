import type { Stat } from '../types/stat'
import type { AppliedCondition, Condition } from '../types/condition'

export function applyConditionAffectors(
  stats: Stat[],
  appliedConditions: AppliedCondition[],
  conditionLibrary: Condition[]
): Stat[] {
  const conditionMap = new Map<string, Condition>(conditionLibrary.map(c => [c.id, c]))
  const statsMap = new Map<string, Stat>(stats.map(s => [s.id, { ...s }]))

  for (const applied of appliedConditions) {
    const condition = conditionMap.get(applied.conditionId)
    if (!condition || !condition.affectorRules) continue
    for (const rule of condition.affectorRules) {
      const stat = statsMap.get(rule.statId)
      if (!stat || typeof rule.modifier !== 'number') continue
      statsMap.set(rule.statId, { ...stat, value: stat.value + rule.modifier })
    }
  }

  return Array.from(statsMap.values())
}
