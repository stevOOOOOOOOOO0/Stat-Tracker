import { create } from 'zustand'

interface UIState {
  activeTab: number
  isDiceCalculatorOpen: boolean
  isSearchOpen: boolean
  openSheet: string | null
  isDarkMode: boolean

  setActiveTab: (tab: number) => void
  openDiceCalculator: () => void
  closeDiceCalculator: () => void
  openSearch: () => void
  closeSearch: () => void
  openBottomSheet: (name: string) => void
  closeBottomSheet: () => void
  toggleDarkMode: () => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 0,
  isDiceCalculatorOpen: false,
  isSearchOpen: false,
  openSheet: null,
  isDarkMode: true,

  setActiveTab: (tab) => set({ activeTab: tab }),
  openDiceCalculator: () => set({ isDiceCalculatorOpen: true }),
  closeDiceCalculator: () => set({ isDiceCalculatorOpen: false }),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  openBottomSheet: (name) => set({ openSheet: name }),
  closeBottomSheet: () => set({ openSheet: null }),
  toggleDarkMode: () => set(state => ({ isDarkMode: !state.isDarkMode })),
}))
