import { useCharacterStore } from '../store/characterStore'

export function useCharacter() {
  const activeCharacterId = useCharacterStore(state => state.activeCharacterId)
  const characters = useCharacterStore(state => state.characters)

  const character = activeCharacterId ? characters[activeCharacterId] ?? null : null

  const setActiveCharacter = useCharacterStore(state => state.setActiveCharacter)
  const createCharacter = useCharacterStore(state => state.createCharacter)
  const updateCharacter = useCharacterStore(state => state.updateCharacter)
  const updateStat = useCharacterStore(state => state.updateStat)
  const addStat = useCharacterStore(state => state.addStat)
  const removeStat = useCharacterStore(state => state.removeStat)
  const incrementStat = useCharacterStore(state => state.incrementStat)
  const decrementStat = useCharacterStore(state => state.decrementStat)
  const addItem = useCharacterStore(state => state.addItem)
  const updateItem = useCharacterStore(state => state.updateItem)
  const removeItem = useCharacterStore(state => state.removeItem)
  const addAbility = useCharacterStore(state => state.addAbility)
  const updateAbility = useCharacterStore(state => state.updateAbility)
  const removeAbility = useCharacterStore(state => state.removeAbility)
  const appendHistory = useCharacterStore(state => state.appendHistory)
  const applyCondition = useCharacterStore(state => state.applyCondition)
  const removeCondition = useCharacterStore(state => state.removeCondition)
  const triggerRestAction = useCharacterStore(state => state.triggerRestAction)
  const updateBiography = useCharacterStore(state => state.updateBiography)
  const setLevel = useCharacterStore(state => state.setLevel)

  return {
    character,
    activeCharacterId,
    setActiveCharacter,
    createCharacter,
    updateCharacter,
    updateStat,
    addStat,
    removeStat,
    incrementStat,
    decrementStat,
    addItem,
    updateItem,
    removeItem,
    addAbility,
    updateAbility,
    removeAbility,
    appendHistory,
    applyCondition,
    removeCondition,
    triggerRestAction,
    updateBiography,
    setLevel,
  }
}
