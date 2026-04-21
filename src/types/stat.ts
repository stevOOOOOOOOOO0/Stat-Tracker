export type StatCategory = 'base' | 'derived' | 'resource' | 'text' | 'boolean'

export interface Stat {
  id: string
  name: string
  category: StatCategory
  value: number | string | boolean
  currentValue?: number
  maxValue?: number | string
  min?: number
  max?: number | string
  formula?: string
  affectors?: string[]
  order: number
  description?: string
}
