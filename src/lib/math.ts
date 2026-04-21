import { create, all } from 'mathjs'
import type { Stat } from '../types/stat'

export const math = create(all, {})

function statNameToKey(name: string): string {
  return name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
}

export function buildStatScope(stats: Stat[]): Record<string, number> {
  const scope: Record<string, number> = {}
  for (const stat of stats) {
    const key = statNameToKey(stat.name)
    if (!key) continue
    scope[key] = stat.value
  }
  return scope
}
