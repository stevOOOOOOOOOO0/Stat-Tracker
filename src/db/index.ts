import Dexie, { type Table } from 'dexie'
import type { Campaign } from '../types/campaign'
import type { Character } from '../types/character'
import type { Condition } from '../types/condition'
import type { SessionNote } from '../types/session'
import type { InitiativeTracker } from '../types/initiative'

export class StatTrackerDB extends Dexie {
  campaigns!: Table<Campaign, string>
  characters!: Table<Character, string>
  conditions!: Table<Condition, string>
  sessionNotes!: Table<SessionNote, string>
  initiativeTrackers!: Table<InitiativeTracker, string>

  constructor() {
    super('StatTrackerDB')
    this.version(1).stores({
      campaigns: 'id, name',
      characters: 'id, campaignId',
      conditions: 'id, isLibraryEntry',
      sessionNotes: 'id, campaignId',
      initiativeTrackers: 'campaignId',
    })
  }
}

export const db = new StatTrackerDB()
