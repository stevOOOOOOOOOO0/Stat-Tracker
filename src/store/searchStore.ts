import { create } from 'zustand'

interface SearchState {
  query: string
  scope: 'character' | 'campaign'

  setQuery: (q: string) => void
  setScope: (s: 'character' | 'campaign') => void
  clearSearch: () => void
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  scope: 'character',

  setQuery: (q) => set({ query: q }),
  setScope: (s) => set({ scope: s }),
  clearSearch: () => set({ query: '', scope: 'character' }),
}))
