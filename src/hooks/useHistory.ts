import { useCharacterStore } from '../store/characterStore'
import type { HistoryEntry, HistoryEntryType } from '../types/history'
import { generateId } from '../lib/ids'
import { now } from '../lib/dates'

type NewHistoryEntry = Omit<HistoryEntry, 'id' | 'timestamp' | 'characterId'>

export function useHistory() {
  const activeCharacterId = useCharacterStore(state => state.activeCharacterId)
  const appendHistoryAction = useCharacterStore(state => state.appendHistory)

  return {
    appendHistory: (entry: NewHistoryEntry) => {
      if (!activeCharacterId) return
      const fullEntry: HistoryEntry = {
        ...entry,
        id: generateId(),
        timestamp: now(),
        characterId: activeCharacterId,
      }
      appendHistoryAction(activeCharacterId, fullEntry)
    },
  }
}
