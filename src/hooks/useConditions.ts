import { useState, useEffect } from 'react'
import { useCharacterStore } from '../store/characterStore'
import type { AppliedCondition, Condition } from '../types/condition'
import { seedConditionLibrary, getConditionLibrary } from '../db/tables/conditions'

export function useConditions() {
  const activeCharacterId = useCharacterStore(state => state.activeCharacterId)
  const characters = useCharacterStore(state => state.characters)
  const applyConditionAction = useCharacterStore(state => state.applyCondition)
  const removeConditionAction = useCharacterStore(state => state.removeCondition)

  const [conditionLibrary, setConditionLibrary] = useState<Condition[]>([])

  useEffect(() => {
    async function loadLibrary() {
      await seedConditionLibrary()
      const library = await getConditionLibrary()
      setConditionLibrary(library)
    }
    loadLibrary()
  }, [])

  const character = activeCharacterId ? characters[activeCharacterId] ?? null : null
  const appliedConditions = character?.appliedConditions ?? []

  return {
    appliedConditions,
    conditionLibrary,
    applyCondition: (appliedCondition: AppliedCondition) => {
      if (activeCharacterId) {
        applyConditionAction(activeCharacterId, appliedCondition, conditionLibrary)
      }
    },
    removeCondition: (conditionId: string) => {
      if (activeCharacterId) {
        removeConditionAction(activeCharacterId, conditionId, conditionLibrary)
      }
    },
  }
}
