export interface ConditionAffector {
  statId: string
  modifier: number | string
}

export interface Condition {
  id: string
  name: string
  description?: string
  affectorRules?: ConditionAffector[]
  durationType: 'rounds' | 'session' | 'permanent'
  duration?: number
  isLibraryEntry: boolean
}

export interface AppliedCondition {
  conditionId: string
  characterId: string
  appliedAt: string
  remainingRounds?: number
}
