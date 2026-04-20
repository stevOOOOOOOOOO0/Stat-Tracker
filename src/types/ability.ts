import type { RollExpression } from './item'

export interface Ability {
  id: string
  characterId: string
  name: string
  description?: string
  rollExpressions: RollExpression[]
  affectorIds: string[]
  resourceCostStatId?: string
  resourceCostAmount?: number
  rechargeCondition?: string
  prepared: boolean
  order: number
}
