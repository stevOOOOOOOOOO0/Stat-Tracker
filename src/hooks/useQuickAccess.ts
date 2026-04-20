import { useCharacterStore } from '../store/characterStore'
import type { UsageRecord } from '../types/usage'
import type { Stat } from '../types/stat'
import type { Item } from '../types/item'
import type { Ability } from '../types/ability'

interface QuickAccessEntry {
  record: UsageRecord
  entity: Stat | Item | Ability | null
}

/**
 * Returns top-4 quick access entries sorted by pinned first, then usage count.
 */
export function useQuickAccess(): QuickAccessEntry[] {
  const activeCharacterId = useCharacterStore(state => state.activeCharacterId)
  const characters = useCharacterStore(state => state.characters)

  if (!activeCharacterId) return []

  const character = characters[activeCharacterId]
  if (!character) return []

  // Sort records: pinned first, then by count descending
  const sorted = [...character.usageRecords].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
    return b.count - a.count
  })

  const top4 = sorted.slice(0, 4)

  return top4.map(record => {
    let entity: Stat | Item | Ability | null = null

    if (record.entityType === 'stat') {
      entity = character.stats.find(s => s.id === record.entityId) ?? null
    } else if (record.entityType === 'item') {
      entity = character.items.find(i => i.id === record.entityId) ?? null
    } else if (record.entityType === 'ability') {
      entity = character.abilities.find(a => a.id === record.entityId) ?? null
    }

    return { record, entity }
  })
}
