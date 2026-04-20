import { useCharacterStore } from '../store/characterStore'
import { buildGraph, getDownstream } from '../engine/affectorGraph'

/**
 * Returns the list of downstream stat names that depend on the given statId.
 */
export function useStatAffectors(statId: string): string[] {
  const activeCharacterId = useCharacterStore(state => state.activeCharacterId)
  const characters = useCharacterStore(state => state.characters)

  if (!activeCharacterId) return []

  const character = characters[activeCharacterId]
  if (!character) return []

  const graph = buildGraph(character.stats)
  const downstreamIds = getDownstream(statId, graph)

  const idToName = new Map(character.stats.map(s => [s.id, s.name]))
  return downstreamIds.map(id => idToName.get(id) ?? id)
}
