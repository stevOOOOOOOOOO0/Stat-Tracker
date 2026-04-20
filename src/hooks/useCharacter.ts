import { useCharacterStore } from '../store/characterStore'

export function useCharacter() {
  const activeCharacterId = useCharacterStore(state => state.activeCharacterId)
  const characters = useCharacterStore(state => state.characters)
  const effectiveStatsMap = useCharacterStore(state => state.effectiveStats)

  const character = activeCharacterId ? characters[activeCharacterId] ?? null : null
  const effectiveStats = activeCharacterId ? effectiveStatsMap[activeCharacterId] ?? [] : []

  const setActiveCharacter = useCharacterStore(state => state.setActiveCharacter)
  const createCharacter = useCharacterStore(state => state.createCharacter)
  const updateCharacter = useCharacterStore(state => state.updateCharacter)
  const updateStat = useCharacterStore(state => state.updateStat)
  const addStat = useCharacterStore(state => state.addStat)
  const removeStat = useCharacterStore(state => state.removeStat)
  const addStatBlock = useCharacterStore(state => state.addStatBlock)
  const updateStatBlock = useCharacterStore(state => state.updateStatBlock)
  const removeStatBlock = useCharacterStore(state => state.removeStatBlock)
  const addItem = useCharacterStore(state => state.addItem)
  const updateItem = useCharacterStore(state => state.updateItem)
  const removeItem = useCharacterStore(state => state.removeItem)
  const addAbility = useCharacterStore(state => state.addAbility)
  const updateAbility = useCharacterStore(state => state.updateAbility)
  const removeAbility = useCharacterStore(state => state.removeAbility)
  const addNote = useCharacterStore(state => state.addNote)
  const updateNote = useCharacterStore(state => state.updateNote)
  const removeNote = useCharacterStore(state => state.removeNote)
  const appendHistory = useCharacterStore(state => state.appendHistory)
  const recordUsage = useCharacterStore(state => state.recordUsage)
  const pinQuickAccess = useCharacterStore(state => state.pinQuickAccess)
  const applyCondition = useCharacterStore(state => state.applyCondition)
  const removeCondition = useCharacterStore(state => state.removeCondition)
  const triggerRestAction = useCharacterStore(state => state.triggerRestAction)
  const updateCurrency = useCharacterStore(state => state.updateCurrency)
  const addCurrency = useCharacterStore(state => state.addCurrency)
  const removeCurrency = useCharacterStore(state => state.removeCurrency)
  const updateBiography = useCharacterStore(state => state.updateBiography)
  const updateXp = useCharacterStore(state => state.updateXp)
  const setLevel = useCharacterStore(state => state.setLevel)

  return {
    character,
    effectiveStats,
    activeCharacterId,
    setActiveCharacter,
    createCharacter,
    updateCharacter,
    updateStat,
    addStat,
    removeStat,
    addStatBlock,
    updateStatBlock,
    removeStatBlock,
    addItem,
    updateItem,
    removeItem,
    addAbility,
    updateAbility,
    removeAbility,
    addNote,
    updateNote,
    removeNote,
    appendHistory,
    recordUsage,
    pinQuickAccess,
    applyCondition,
    removeCondition,
    triggerRestAction,
    updateCurrency,
    addCurrency,
    removeCurrency,
    updateBiography,
    updateXp,
    setLevel,
  }
}
