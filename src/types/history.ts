export type HistoryEntryType =
  | 'stat_change'
  | 'item_used'
  | 'ability_used'
  | 'rest'
  | 'level_up'
  | 'condition_change'
  | 'manual'

export interface HistoryEntry {
  id: string
  characterId: string
  timestamp: string
  type: HistoryEntryType
  description: string
  entityId?: string
  previousValue?: number | string | boolean
  newValue?: number | string | boolean
}
