export interface RollExpression {
  label: string
  formula: string
}

export interface Item {
  id: string
  characterId: string
  name: string
  description?: string
  rollExpressions: RollExpression[]
  affectorIds: string[]
  quantity?: number
  order: number
}
