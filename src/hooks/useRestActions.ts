import { useCharacterStore } from '../store/characterStore'
import type { RestAction } from '../types/rest'
import type { Condition } from '../types/condition'

export function useRestActions() {
  const activeCharacterId = useCharacterStore(state => state.activeCharacterId)
  const characters = useCharacterStore(state => state.characters)
  const triggerRestAction = useCharacterStore(state => state.triggerRestAction)

  const character = activeCharacterId ? characters[activeCharacterId] ?? null : null
  const restActions = character?.restActions ?? []

  return {
    restActions,
    triggerRest: (restAction: RestAction, conditionLibrary: Condition[] = []) => {
      if (activeCharacterId) {
        triggerRestAction(activeCharacterId, restAction, conditionLibrary)
      }
    },
  }
}
