export interface InitiativeEntry {
  id: string
  label: string
  characterId?: string
  initiativeValue: number
  isActive: boolean
}

export interface InitiativeTracker {
  campaignId: string
  round: number
  entries: InitiativeEntry[]
  updatedAt: string
}
