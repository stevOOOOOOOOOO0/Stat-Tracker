import type { Stat } from './stat'
import type { Item } from './item'
import type { Ability } from './ability'
import type { CurrencyDenomination } from './currency'
import type { RestAction } from './rest'
import type { AppliedCondition } from './condition'
import type { Biography } from './biography'
import type { Note } from './note'
import type { HistoryEntry } from './history'

export interface Character {
  id: string
  campaignId: string
  name: string
  avatarUrl?: string
  ownerId?: string
  level: number
  currency: CurrencyDenomination[]
  stats: Stat[]
  items: Item[]
  abilities: Ability[]
  restActions: RestAction[]
  appliedConditions: AppliedCondition[]
  biography: Biography
  notes: Note[]
  history: HistoryEntry[]
  createdAt: string
  updatedAt: string
}
