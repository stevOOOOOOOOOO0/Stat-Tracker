export type RestResetMode = 'full' | 'fixed' | 'roll'

export interface RestReset {
  statId: string
  mode: RestResetMode
  amount?: number
  formula?: string
}

export interface RestAction {
  id: string
  characterId: string
  name: string
  resets: RestReset[]
}
