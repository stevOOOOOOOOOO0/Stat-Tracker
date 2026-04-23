export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'

export type AffectTarget = 'baseValue' | 'minValue' | 'maxValue'

export const AFFECT_TARGET_LABELS: Record<AffectTarget, string> = {
  baseValue: 'Value',
  minValue:  'Minimum',
  maxValue:  'Maximum',
}

export interface AffecteeEntry {
  id: string
  target: AffectTarget
}

export interface Stat {
  id: string
  name: string
  baseValue: number
  minValue?: number
  maxValue?: number
  isRollable: boolean
  diceCount: number
  diceType: DiceType
  affectees: AffecteeEntry[]
  order: number
}
