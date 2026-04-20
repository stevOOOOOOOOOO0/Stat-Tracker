import { useCharacterStore } from '../store/characterStore'
import type { UsageEntityType } from '../types/usage'

export function useUsageTracker() {
  const activeCharacterId = useCharacterStore(state => state.activeCharacterId)
  const recordUsage = useCharacterStore(state => state.recordUsage)

  return {
    recordUsage: (entityId: string, entityType: UsageEntityType) => {
      if (activeCharacterId) {
        recordUsage(activeCharacterId, entityId, entityType)
      }
    },
  }
}
