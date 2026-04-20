import { create } from 'zustand'
import type { Character } from '../types/character'
import type { Stat, StatBlock } from '../types/stat'
import type { Item } from '../types/item'
import type { Ability } from '../types/ability'
import type { Note } from '../types/note'
import type { HistoryEntry } from '../types/history'
import type { UsageRecord, UsageEntityType } from '../types/usage'
import type { AppliedCondition, Condition } from '../types/condition'
import type { RestAction } from '../types/rest'
import type { Biography } from '../types/biography'
import type { CurrencyDenomination } from '../types/currency'
import {
  getCharactersByCampaign,
  getCharacter as dbGetCharacter,
  createCharacter as dbCreateCharacter,
  updateCharacter as dbUpdateCharacter,
  deleteCharacter as dbDeleteCharacter,
} from '../db/tables/characters'
import { generateId } from '../lib/ids'
import { now } from '../lib/dates'
import { buildGraph, getDownstream, topologicalSort } from '../engine/affectorGraph'
import { evaluateFormula } from '../engine/formulaEngine'
import { applyConditionAffectors } from '../engine/conditionProcessor'
import { applyRestAction } from '../engine/restProcessor'

interface CharacterState {
  characters: Record<string, Character>
  activeCharacterId: string | null
  effectiveStats: Record<string, Stat[]>

  loadCharacters: (campaignId: string) => Promise<void>
  setActiveCharacter: (id: string | null) => void
  createCharacter: (data: Partial<Character>) => Promise<Character>
  updateCharacter: (id: string, updates: Partial<Character>) => Promise<void>
  updateStat: (characterId: string, stat: Stat) => void
  addStat: (characterId: string, stat: Stat) => void
  removeStat: (characterId: string, statId: string) => void
  addStatBlock: (characterId: string, block: StatBlock) => void
  updateStatBlock: (characterId: string, block: StatBlock) => void
  removeStatBlock: (characterId: string, blockId: string) => void
  addItem: (characterId: string, item: Item) => void
  updateItem: (characterId: string, item: Item) => void
  removeItem: (characterId: string, itemId: string) => void
  addAbility: (characterId: string, ability: Ability) => void
  updateAbility: (characterId: string, ability: Ability) => void
  removeAbility: (characterId: string, abilityId: string) => void
  addNote: (characterId: string, note: Note) => void
  updateNote: (characterId: string, note: Note) => void
  removeNote: (characterId: string, noteId: string) => void
  appendHistory: (characterId: string, entry: HistoryEntry) => void
  recordUsage: (characterId: string, entityId: string, entityType: UsageEntityType) => void
  pinQuickAccess: (characterId: string, entityId: string, isPinned: boolean) => void
  applyCondition: (characterId: string, appliedCondition: AppliedCondition, conditionLibrary: Condition[]) => void
  removeCondition: (characterId: string, conditionId: string, conditionLibrary: Condition[]) => void
  triggerRestAction: (characterId: string, restAction: RestAction, conditionLibrary: Condition[]) => void
  updateCurrency: (characterId: string, denomId: string, amount: number) => void
  addCurrency: (characterId: string, denom: CurrencyDenomination) => void
  removeCurrency: (characterId: string, denomId: string) => void
  updateBiography: (characterId: string, biography: Biography) => void
  updateXp: (characterId: string, xp: number) => void
  setLevel: (characterId: string, level: number) => void
}

function recomputeEffectiveStats(
  character: Character,
  conditionLibrary: Condition[]
): Stat[] {
  return applyConditionAffectors(
    character.stats,
    character.appliedConditions,
    conditionLibrary
  )
}

function cascadeAffectors(stats: Stat[], updatedStatId: string): Stat[] {
  const graph = buildGraph(stats)
  const downstreamIds = getDownstream(updatedStatId, graph)
  if (downstreamIds.length === 0) return stats

  const sortedIds = topologicalSort(downstreamIds, graph)
  let currentStats = [...stats]

  for (const statId of sortedIds) {
    const stat = currentStats.find(s => s.id === statId)
    if (!stat || stat.category !== 'derived' || !stat.formula) continue

    const result = evaluateFormula(stat.formula, currentStats)
    if (!result.error) {
      currentStats = currentStats.map(s =>
        s.id === statId ? { ...s, value: result.value } : s
      )
    }
  }

  return currentStats
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: {},
  activeCharacterId: null,
  effectiveStats: {},

  loadCharacters: async (campaignId) => {
    const list = await getCharactersByCampaign(campaignId)
    const map: Record<string, Character> = {}
    for (const char of list) {
      map[char.id] = char
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
      currentXp: data.currentXp ?? 0,
      currency: data.currency ?? [],
      statBlocks: data.statBlocks ?? [],
      stats: data.stats ?? [],
      items: data.items ?? [],
      abilities: data.abilities ?? [],
      restActions: data.restActions ?? [],
      appliedConditions: data.appliedConditions ?? [],
      biography: data.biography ?? { characterId: id, sections: [] },
      notes: data.notes ?? [],
      history: data.history ?? [],
      usageRecords: data.usageRecords ?? [],
      createdAt: timestamp,
      updatedAt: timestamp,
      ...data,
      id,
    }
    set(state => ({
      characters: { ...state.characters, [id]: character },
      effectiveStats: {
        ...state.effectiveStats,
        [id]: character.stats,
      },
    }))
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

  updateStat: (characterId, stat) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state

      const prevStat = character.stats.find(s => s.id === stat.id)

      // Replace the stat
      let newStats = character.stats.map(s => s.id === stat.id ? stat : s)

      // Cascade affector recalculations
      newStats = cascadeAffectors(newStats, stat.id)

      // Append history entry
      const historyEntry: HistoryEntry = {
        id: generateId(),
        characterId,
        timestamp: now(),
        type: 'stat_change',
        description: `${stat.name} changed`,
        entityId: stat.id,
        previousValue: prevStat?.value,
        newValue: stat.value,
      }

      const updatedChar: Character = {
        ...character,
        stats: newStats,
        history: [...character.history, historyEntry],
        updatedAt: now(),
      }

      // Recompute effective stats — use empty condition library here;
      // full recompute happens when conditionLibrary is available via applyCondition
      const effectiveStatsForChar = applyConditionAffectors(
        newStats,
        updatedChar.appliedConditions,
        [] // condition library not available here; effects cleared
      )

      dbUpdateCharacter(characterId, updatedChar)

      return {
        characters: { ...state.characters, [characterId]: updatedChar },
        effectiveStats: {
          ...state.effectiveStats,
          [characterId]: effectiveStatsForChar,
        },
      }
    })
  },

  addStat: (characterId, stat) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state
      const updatedChar: Character = {
        ...character,
        stats: [...character.stats, stat],
        updatedAt: now(),
      }
      dbUpdateCharacter(characterId, updatedChar)
      return {
        characters: { ...state.characters, [characterId]: updatedChar },
        effectiveStats: {
          ...state.effectiveStats,
          [characterId]: updatedChar.stats,
        },
      }
    })
  },

  removeStat: (characterId, statId) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state
      const updatedChar: Character = {
        ...character,
        stats: character.stats.filter(s => s.id !== statId),
        usageRecords: character.usageRecords.filter(u => u.entityId !== statId),
        updatedAt: now(),
      }
      dbUpdateCharacter(characterId, updatedChar)
      return {
        characters: { ...state.characters, [characterId]: updatedChar },
        effectiveStats: {
          ...state.effectiveStats,
          [characterId]: updatedChar.stats,
        },
      }
    })
  },

  addStatBlock: (characterId, block) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state
      const updatedChar: Character = {
        ...character,
        statBlocks: [...character.statBlocks, block],
        updatedAt: now(),
      }
      dbUpdateCharacter(characterId, updatedChar)
      return { characters: { ...state.characters, [characterId]: updatedChar } }
    })
  },

  updateStatBlock: (characterId, block) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state
      const updatedChar: Character = {
        ...character,
        statBlocks: character.statBlocks.map(b => b.id === block.id ? block : b),
        updatedAt: now(),
      }
      dbUpdateCharacter(characterId, updatedChar)
      return { characters: { ...state.characters, [characterId]: updatedChar } }
    })
  },

  removeStatBlock: (characterId, blockId) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state
      const updatedChar: Character = {
        ...character,
        statBlocks: character.statBlocks.filter(b => b.id !== blockId),
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

  addNote: (characterId, note) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state
      const updatedChar: Character = {
        ...character,
        notes: [...character.notes, note],
        updatedAt: now(),
      }
      dbUpdateCharacter(characterId, updatedChar)
      return { characters: { ...state.characters, [characterId]: updatedChar } }
    })
  },

  updateNote: (characterId, note) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state
      const updatedChar: Character = {
        ...character,
        notes: character.notes.map(n => n.id === note.id ? note : n),
        updatedAt: now(),
      }
      dbUpdateCharacter(characterId, updatedChar)
      return { characters: { ...state.characters, [characterId]: updatedChar } }
    })
  },

  removeNote: (characterId, noteId) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state
      const updatedChar: Character = {
        ...character,
        notes: character.notes.filter(n => n.id !== noteId),
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

  recordUsage: (characterId, entityId, entityType) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state

      const existing = character.usageRecords.find(u => u.entityId === entityId)
      let usageRecords: UsageRecord[]

      if (existing) {
        usageRecords = character.usageRecords.map(u =>
          u.entityId === entityId ? { ...u, count: u.count + 1 } : u
        )
      } else {
        usageRecords = [
          ...character.usageRecords,
          { entityId, entityType, count: 1, isPinned: false },
        ]
      }

      const updatedChar: Character = {
        ...character,
        usageRecords,
        updatedAt: now(),
      }
      dbUpdateCharacter(characterId, updatedChar)
      return { characters: { ...state.characters, [characterId]: updatedChar } }
    })
  },

  pinQuickAccess: (characterId, entityId, isPinned) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state

      const usageRecords = character.usageRecords.map(u =>
        u.entityId === entityId ? { ...u, isPinned } : u
      )

      const updatedChar: Character = {
        ...character,
        usageRecords,
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

      const effectiveStatsForChar = recomputeEffectiveStats(updatedChar, conditionLibrary)

      dbUpdateCharacter(characterId, updatedChar)

      return {
        characters: { ...state.characters, [characterId]: updatedChar },
        effectiveStats: {
          ...state.effectiveStats,
          [characterId]: effectiveStatsForChar,
        },
      }
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

      const effectiveStatsForChar = recomputeEffectiveStats(updatedChar, conditionLibrary)

      dbUpdateCharacter(characterId, updatedChar)

      return {
        characters: { ...state.characters, [characterId]: updatedChar },
        effectiveStats: {
          ...state.effectiveStats,
          [characterId]: effectiveStatsForChar,
        },
      }
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

      const effectiveStatsForChar = recomputeEffectiveStats(updatedChar, conditionLibrary)

      dbUpdateCharacter(characterId, updatedChar)

      return {
        characters: { ...state.characters, [characterId]: updatedChar },
        effectiveStats: {
          ...state.effectiveStats,
          [characterId]: effectiveStatsForChar,
        },
      }
    })
  },

  updateCurrency: (characterId, denomId, amount) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state

      const prevDenom = character.currency.find(c => c.id === denomId)
      const currency = character.currency.map(c =>
        c.id === denomId ? { ...c, amount } : c
      )

      const historyEntry: HistoryEntry = {
        id: generateId(),
        characterId,
        timestamp: now(),
        type: 'currency_change',
        description: `Currency updated: ${prevDenom?.name ?? denomId}`,
        entityId: denomId,
        previousValue: prevDenom?.amount,
        newValue: amount,
      }

      const updatedChar: Character = {
        ...character,
        currency,
        history: [...character.history, historyEntry],
        updatedAt: now(),
      }
      dbUpdateCharacter(characterId, updatedChar)
      return { characters: { ...state.characters, [characterId]: updatedChar } }
    })
  },

  addCurrency: (characterId, denom) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state
      const updatedChar: Character = {
        ...character,
        currency: [...character.currency, denom],
        updatedAt: now(),
      }
      dbUpdateCharacter(characterId, updatedChar)
      return { characters: { ...state.characters, [characterId]: updatedChar } }
    })
  },

  removeCurrency: (characterId, denomId) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state
      const updatedChar: Character = {
        ...character,
        currency: character.currency.filter(c => c.id !== denomId),
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

  updateXp: (characterId, xp) => {
    set(state => {
      const character = state.characters[characterId]
      if (!character) return state

      const didLevelUp = character.xpThreshold !== undefined && xp >= character.xpThreshold
      const history = [...character.history]

      if (didLevelUp) {
        history.push({
          id: generateId(),
          characterId,
          timestamp: now(),
          type: 'level_up',
          description: `Leveled up to ${character.level + 1}`,
          previousValue: character.level,
          newValue: character.level + 1,
        })
      }

      const updatedChar: Character = {
        ...character,
        currentXp: xp,
        level: didLevelUp ? character.level + 1 : character.level,
        history,
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
