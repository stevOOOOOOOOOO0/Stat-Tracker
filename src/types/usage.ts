export type UsageEntityType = 'stat' | 'item' | 'ability'

export interface UsageRecord {
  entityId: string
  entityType: UsageEntityType
  count: number
  isPinned: boolean
}
