import { create, all } from 'mathjs'
import type { Stat } from '../types/stat'

export const math = create(all, {})

/**
 * Converts a stat name to a valid JS identifier key.
 * Replaces spaces with underscores and strips non-alphanumeric/underscore chars.
 */
function statNameToKey(name: string): string {
  return name
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
}

/**
 * Builds a scope object for mathjs formula evaluation.
 * Maps stat name keys to their numeric values.
 * Uses currentValue for resource stats, Number(value) for others.
 */
export function buildStatScope(stats: Stat[]): Record<string, number> {
  const scope: Record<string, number> = {}
  for (const stat of stats) {
    const key = statNameToKey(stat.name)
    if (!key) continue
    if (stat.category === 'resource' && stat.currentValue !== undefined) {
      scope[key] = stat.currentValue
    } else if (typeof stat.value === 'number') {
      scope[key] = stat.value
    } else if (typeof stat.value === 'boolean') {
      scope[key] = stat.value ? 1 : 0
    } else {
      const parsed = Number(stat.value)
      scope[key] = isNaN(parsed) ? 0 : parsed
    }
  }
  return scope
}
