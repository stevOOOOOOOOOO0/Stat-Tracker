import { useSearchStore } from '../store/searchStore'
import { useCharacterStore } from '../store/characterStore'
import type { Stat } from '../types/stat'
import type { Item } from '../types/item'
import type { Ability } from '../types/ability'
import type { Note } from '../types/note'

type SearchResult =
  | { type: 'stat'; item: Stat }
  | { type: 'item'; item: Item }
  | { type: 'ability'; item: Ability }
  | { type: 'note'; item: Note }

function fuzzyMatch(haystack: string, needle: string): boolean {
  if (!needle) return true
  const h = haystack.toLowerCase()
  const n = needle.toLowerCase()
  // Simple substring match as fuzzy baseline
  if (h.includes(n)) return true
  // Character-by-character subsequence match
  let hi = 0
  let ni = 0
  while (hi < h.length && ni < n.length) {
    if (h[hi] === n[ni]) ni++
    hi++
  }
  return ni === n.length
}

export function useSearch(): {
  query: string
  setQuery: (q: string) => void
  results: SearchResult[]
} {
  const query = useSearchStore(state => state.query)
  const setQuery = useSearchStore(state => state.setQuery)

  const activeCharacterId = useCharacterStore(state => state.activeCharacterId)
  const characters = useCharacterStore(state => state.characters)

  const character = activeCharacterId ? characters[activeCharacterId] ?? null : null

  const results: SearchResult[] = []

  if (character && query.trim()) {
    for (const stat of character.stats) {
      if (fuzzyMatch(stat.name, query)) {
        results.push({ type: 'stat', item: stat })
      }
    }
    for (const item of character.items) {
      if (fuzzyMatch(item.name, query)) {
        results.push({ type: 'item', item })
      }
    }
    for (const ability of character.abilities) {
      if (fuzzyMatch(ability.name, query)) {
        results.push({ type: 'ability', item: ability })
      }
    }
    for (const note of character.notes) {
      if (fuzzyMatch(note.title, query)) {
        results.push({ type: 'note', item: note })
      }
    }
  }

  return { query, setQuery, results }
}
