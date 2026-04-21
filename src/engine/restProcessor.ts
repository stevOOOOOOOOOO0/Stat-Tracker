import type { Character } from '../types/character'
import type { RestAction } from '../types/rest'
import type { Stat } from '../types/stat'

export function applyRestAction(character: Character, restAction: RestAction): Stat[] {
  const statsMap = new Map<string, Stat>(character.stats.map(s => [s.id, { ...s }]))

  for (const reset of restAction.resets) {
    const stat = statsMap.get(reset.statId)
    if (!stat) continue
    const amount = reset.amount ?? 0
    statsMap.set(reset.statId, { ...stat, value: stat.value + amount })
  }

  return Array.from(statsMap.values())
}
