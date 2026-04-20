export interface CurrencyDenomination {
  id: string
  name: string
  abbreviation?: string
  amount: number
  conversionToId?: string
  conversionRate?: number
}
