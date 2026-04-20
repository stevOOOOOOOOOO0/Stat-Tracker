import { useCharacterStore } from '../store/characterStore'
import { exportCharacter } from '../lib/export'

export function useExport() {
  const activeCharacterId = useCharacterStore(state => state.activeCharacterId)
  const characters = useCharacterStore(state => state.characters)

  return {
    exportCharacter: () => {
      if (!activeCharacterId) return
      const character = characters[activeCharacterId]
      if (character) {
        exportCharacter(character)
      }
    },
  }
}
