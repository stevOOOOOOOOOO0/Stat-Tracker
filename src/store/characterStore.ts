import { create } from 'zustand'
import type { Character } from '../types/character'
import type { Stat, AffectTarget } from '../types/stat'
import type { Item } from '../types/item'
import type { Ability } from '../types/ability'
import type { HistoryEntry } from '../types/history'
import type { AppliedCondition, Condition } from '../types/condition'
import type { RestAction } from '../types/rest'
import type { Biography } from '../types/biography'
import {
  getCharactersByCampaign,
  getCharacter as dbGetCharacter,
  createCharacter as dbCreateCharacter,
  updateCharacter as dbUpdateCharacter,
  deleteCharacter as dbDeleteCharacter,
} from '../db/tables/characters'
import { generateId } from '../lib/ids'
import { now } from '../lib/dates'
import { applyConditionAffectors } from '../engine/conditionProcessor'
import { applyRestAction } from '../engine/restProcessor'

function migrateCharacter(char: Character): Character {
  const migratedStats = (char.stats ?? []).map(s => {
    const raw = s as unknown as Record<string, unknown>
    return {
      id:          s.id,
      name:        s.name,
      order:       s.order ?? 0,
      baseValue:   s.baseValue !== undefined ? s.baseValue : (raw['value'] as number) ?? 0,
      minValue:    s.minValue,
      maxValue:    s.maxValue,
      isRollable:  s.isRollable ?? false,
      diceCount:   s.diceCount ?? 1,
      diceType:    s.diceType  ?? 'd20',
      affectees: s.affectees
        ?? ((raw['affecteeIds'] ?? raw['clientIds']) as string[] | undefined)
          ?.map(id => ({ id, target: 'baseValue' as AffectTarget }))
        ?? [],
    }
  })

  const sheetOrder = char.sheetOrder ?? [
    ...[...migratedStats].sort((a, b) => a.order - b.order).map(s => s.id),
    ...[...(char.items ?? [])].sort((a, b) => a.order - b.order).map(i => i.id),
    ...[...(char.abilities ?? [])].sort((a, b) => a.order - b.order).map(a => a.id),
    ...[...(char.biography?.sections ?? [])].sort((a, b) => a.order - b.order).map(s => s.id),
  ]

  return { ...char, stats: migratedStats, sheetOrder }
}

interface CharacterState {
  characters: Record<string, Character>
  activeCharacterId: string | null

  loadCharacters: (campaignId: string) => Promise<void>
  setActiveCharacter: (id: string | null) => void
  createCharacter: (data: Partial<Character>) => Promise<Character>
  updateCharacter: (id: string, updates: Partial<Character>) => Promise<void>
  updateStat: (characterId: string, stat: Stat, affectorEntries?: { statId: string; target: AffectTarget }[]) => void
  addStat: (characterId: string, stat: Stat, affectorEntries?: { statId: string; target: AffectTarget }[]) => void
  removeStat: (characterId: string, statId: string) => void
  incrementStat: (characterId: string, statId: string) => void
  decrementStat: (characterId: string, statId: string) => void
  addItem: (characterId: string, item: Item) => void
  updateItem: (characterId: string, item: Item) => void
  removeItem: (characterId: string, itemId: string) => void
  addAbility: (characterId: string, ability: Ability) => void
  updateAbility: (characterId: string, ability: Ability) => void
  removeAbility: (characterId: string, abilityId: string) => void
  appendHistory: (characterId: string, entry: HistoryEntry) => void
  applyCondition: (characterId: string, appliedCondition: AppliedCondition, conditionLibrary: Condition[]) => void
  removeCondition: (characterId: string, conditionId: string, conditionLibrary: Condition[]) => void
  triggerRestAction: (characterId: string, restAction: RestAction, conditionLibrary: Condition[]) => void
  updateBiography: (characterId: string, biography: Biography) => void
  setLevel: (characterId: string, level: number) => void
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: {},
  activeCharacterId: null,

  loadCharacters: async (campaignId) => {
    const list = await getCharactersByCampaign(campaignId)
    const map: Record<string, Character> = {}
    for (const char of list) {
      map[char.id] = migrateCharacter(char)
    }
    set({ characters: map })
  },

  setActiveCharacter: (id) => {
    set({ activeCharacterId: id })
  },

  createCharacter: async (data) => {
    const timestamp = now()
    const id = data.id ?? generateId()
    const character: Character = {
      campaignId: data.campaignId ?? '',
      name: data.name ?? 'Unnamed Character',
      level: data.level ?? 1,
      stats: data.stats ?? [],
      items: data.items ?? [],
      abilities: data.abilities ?? [],
      restActions: data.restActions ?? [],
      appliedConditions: data.appliedConditions ?? [],
      biography: data.biography ?? { characterId: id, sections: [] },
      history: data.history ?? [],
      createdAt: timestamp,
      updatedAt: timestamp,
      ...data,
      id,
    }
    set(state => ({ characters: { ...state.characters, [id]: character } }))
    dbCreateCharacter(character)
    return character
  },

  updateCharacter: async (id, updates) => {
    const updated = { ...updates, updatedAt: now() }
    set(state => {
      const existing = state.characters[id]
      if (!existing) return state
      const merged = { ...existing, ...updated }
      return {
        characters: { ...state.characters, [id]: merged },
      }
    })
    const char = get().characters[id]
    if (char) dbUpdateCharacter(id, char)
  },

  updateStat: (characterId, stat, affectorEntries) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state
      const prevStat = character.stats.find(s => s.id === stat.id)
      const historyEntry: HistoryEntry = {
        id: generateId(),
        characterId,
        timestamp: now(),
        type: 'stat_change',
        description: `${stat.name} changed`,
        entityId: stat.id,
        previousValue: prevStat?.baseValue,
        newValue: stat.baseValue,
      }
      let stats = character.stats.map(s => s.id === stat.id ? stat : s)
      // Sync other stats' affectees arrays to match the declared affectorEntries for this stat.
      if (affectorEntries !== undefined) {
        stats = stats.map(s => {
          if (s.id === stat.id) return s
          const withoutThis = (s.affectees ?? []).filter(e => e.id !== stat.id)
          const newEntries = affectorEntries.filter(e => e.statId === s.id).map(e => ({ id: stat.id, target: e.target }))
          return { ...s, affectees: [...withoutThis, ...newEntries] }
        })
      }
      const updatedChar: Character = { ...character, stats, history: [...character.history, historyEntry], updatedAt: now() }
      dbUpdateCharacter(characterId, updatedChar)
      return { characters: { ...state.characters, [characterId]: updatedChar } }
    })
  },

  addStat: (characterId, stat, affectorEntries) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state
      let stats = [...character.stats, stat]
      if (affectorEntries?.length) {
        stats = stats.map(s => {
          const newEntries = affectorEntries.filter(e => e.statId === s.id).map(e => ({ id: stat.id, target: e.target }))
          if (!newEntries.length) return s
          return { ...s, affectees: [...(s.affectees ?? []), ...newEntries] }
        })
      }
      const updatedChar: Character = { ...character, stats, updatedAt: now() }
      dbUpdateCharacter(characterId, updatedChar)
      return { characters: { ...state.characters, [characterId]: updatedChar } }
    })
  },

  removeStat: (characterId, statId) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state
      const updatedChar: Character = {
        ...character,
        stats: character.stats.filter(s => s.id !== statId),
        updatedAt: now(),
      }
      dbUpdateCharacter(characterId, updatedChar)
      return { characters: { ...state.characters, [characterId]: updatedChar } }
    })
  },

  incrementStat: (characterId, statId) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state
      const stat = character.stats.find(s => s.id === statId)
      if (!stat) return state
      const derivedMax = stat.maxValue !== undefined
        ? stat.maxValue + character.stats.reduce((sum, s) => {
            if (s.id === statId) return sum
            const e = (s.affectees ?? []).find(e => e.id === statId && e.target === 'maxValue')
            return e ? sum + s.baseValue : sum
          }, 0)
        : undefined
      const newValue = derivedMax !== undefined
        ? Math.min(derivedMax, stat.baseValue + 1)
        : stat.baseValue + 1
      const updatedStat = { ...stat, baseValue: newValue }
      const historyEntry: HistoryEntry = {
        id: generateId(),
        characterId,
        timestamp: now(),
        type: 'stat_change',
        description: `${stat.name}: ${stat.baseValue} → ${newValue}`,
        entityId: statId,
        previousValue: stat.baseValue,
        newValue,
      }
      const updatedChar: Character = {
        ...character,
        stats: character.stats.map(s => s.id === statId ? updatedStat : s),
        history: [...character.history, historyEntry],
        updatedAt: now(),
      }
      dbUpdateCharacter(characterId, updatedChar)
      return { characters: { ...state.characters, [characterId]: updatedChar } }
    })
  },

  decrementStat: (characterId, statId) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state
      const stat = character.stats.find(s => s.id === statId)
      if (!stat) return state
      const derivedMin = stat.minValue !== undefined
        ? stat.minValue + character.stats.reduce((sum, s) => {
            if (s.id === statId) return sum
            const e = (s.affectees ?? []).find(e => e.id === statId && e.target === 'minValue')
            return e ? sum + s.baseValue : sum
          }, 0)
        : undefined
      const newValue = derivedMin !== undefined
        ? Math.max(derivedMin, stat.baseValue - 1)
        : stat.baseValue - 1
      const updatedStat = { ...stat, baseValue: newValue }
      const historyEntry: HistoryEntry = {
        id: generateId(),
        characterId,
        timestamp: now(),
        type: 'stat_change',
        description: `${stat.name}: ${stat.baseValue} → ${newValue}`,
        entityId: statId,
        previousValue: stat.baseValue,
        newValue,
      }
      const updatedChar: Character = {
        ...character,
        stats: character.stats.map(s => s.id === statId ? updatedStat : s),
        history: [...character.history, historyEntry],
        updatedAt: now(),
      }
      dbUpdateCharacter(characterId, updatedChar)
      return { characters: { ...state.characters, [characterId]: updatedChar } }
    })
  },

  addItem: (characterId, item) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state
      const updatedChar: Character = {
        ...character,
        items: [...character.items, item],
        updatedAt: now(),
      }
      dbUpdateCharacter(characterId, updatedChar)
      return { characters: { ...state.characters, [characterId]: updatedChar } }
    })
  },

  updateItem: (characterId, item) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state
      const updatedChar: Character = {
        ...character,
        items: character.items.map(i => i.id === item.id ? item : i),
        updatedAt: now(),
      }
      dbUpdateCharacter(characterId, updatedChar)
      return { characters: { ...state.characters, [characterId]: updatedChar } }
    })
  },

  removeItem: (characterId, itemId) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state
      const updatedChar: Character = {
        ...character,
        items: character.items.filter(i => i.id !== itemId),
        updatedAt: now(),
      }
      dbUpdateCharacter(characterId, updatedChar)
      return { characters: { ...state.characters, [characterId]: updatedChar } }
    })
  },

  addAbility: (characterId, ability) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state
      const updatedChar: Character = {
        ...character,
        abilities: [...character.abilities, ability],
        updatedAt: now(),
      }
      dbUpdateCharacter(characterId, updatedChar)
      return { characters: { ...state.characters, [characterId]: updatedChar } }
    })
  },

  updateAbility: (characterId, ability) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state
      const updatedChar: Character = {
        ...character,
        abilities: character.abilities.map(a => a.id === ability.id ? ability : a),
        updatedAt: now(),
      }
      dbUpdateCharacter(characterId, updatedChar)
      return { characters: { ...state.characters, [characterId]: updatedChar } }
    })
  },

  removeAbility: (characterId, abilityId) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state
      const updatedChar: Character = {
        ...character,
        abilities: character.abilities.filter(a => a.id !== abilityId),
        updatedAt: now(),
      }
      dbUpdateCharacter(characterId, updatedChar)
      return { characters: { ...state.characters, [characterId]: updatedChar } }
    })
  },


  appendHistory: (characterId, entry) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state
      const updatedChar: Character = {
        ...character,
        history: [...character.history, entry],
        updatedAt: now(),
      }
      dbUpdateCharacter(characterId, updatedChar)
      return { characters: { ...state.characters, [characterId]: updatedChar } }
    })
  },

  applyCondition: (characterId, appliedCondition, conditionLibrary) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state

      // Avoid duplicates
      const alreadyApplied = character.appliedConditions.some(
        ac => ac.conditionId === appliedCondition.conditionId
      )
      const appliedConditions = alreadyApplied
        ? character.appliedConditions
        : [...character.appliedConditions, appliedCondition]

      const updatedChar: Character = {
        ...character,
        appliedConditions,
        history: [
          ...character.history,
          {
            id: generateId(),
            characterId,
            timestamp: now(),
            type: 'condition_change',
            description: `Condition applied: ${appliedCondition.conditionId}`,
            entityId: appliedCondition.conditionId,
          },
        ],
        updatedAt: now(),
      }

      dbUpdateCharacter(characterId, updatedChar)
      return { characters: { ...state.characters, [characterId]: updatedChar } }
    })
  },

  removeCondition: (characterId, conditionId, conditionLibrary) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state

      const appliedConditions = character.appliedConditions.filter(
        ac => ac.conditionId !== conditionId
      )

      const updatedChar: Character = {
        ...character,
        appliedConditions,
        history: [
          ...character.history,
          {
            id: generateId(),
            characterId,
            timestamp: now(),
            type: 'condition_change',
            description: `Condition removed: ${conditionId}`,
            entityId: conditionId,
          },
        ],
        updatedAt: now(),
      }

      dbUpdateCharacter(characterId, updatedChar)
      return { characters: { ...state.characters, [characterId]: updatedChar } }
    })
  },

  triggerRestAction: (characterId, restAction, conditionLibrary) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state

      const newStats = applyRestAction(character, restAction)

      const historyEntry: HistoryEntry = {
        id: generateId(),
        characterId,
        timestamp: now(),
        type: 'rest',
        description: `Rest action taken: ${restAction.name}`,
        entityId: restAction.id,
      }

      const updatedChar: Character = {
        ...character,
        stats: newStats,
        history: [...character.history, historyEntry],
        updatedAt: now(),
      }

      dbUpdateCharacter(characterId, updatedChar)
      return { characters: { ...state.characters, [characterId]: updatedChar } }
    })
  },

  updateBiography: (characterId, biography) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state
      const updatedChar: Character = {
        ...character,
        biography,
        updatedAt: now(),
      }
      dbUpdateCharacter(characterId, updatedChar)
      return { characters: { ...state.characters, [characterId]: updatedChar } }
    })
  },

  setLevel: (characterId, level) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state

      const historyEntry: HistoryEntry = {
        id: generateId(),
        characterId,
        timestamp: now(),
        type: 'level_up',
        description: `Level set to ${level}`,
        previousValue: character.level,
        newValue: level,
      }

      const updatedChar: Character = {
        ...character,
        level,
        history: [...character.history, historyEntry],
        updatedAt: now(),
      }
      dbUpdateCharacter(characterId, updatedChar)
      return { characters: { ...state.characters, [characterId]: updatedChar } }
    })
  },
}))
