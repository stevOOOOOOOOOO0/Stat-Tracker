import React from 'react'
import { useUIStore } from '../../store/uiStore'
import { BottomSheet } from './BottomSheet'
import { DiceCalculator } from './DiceCalculator'

export function DiceCalculatorButton() {
  const isDiceCalculatorOpen = useUIStore((state) => state.isDiceCalculatorOpen)
  const openDiceCalculator = useUIStore((state) => state.openDiceCalculator)
  const closeDiceCalculator = useUIStore((state) => state.closeDiceCalculator)

  return (
    <>
      <button
        type="button"
        onClick={openDiceCalculator}
        aria-label="Open dice calculator"
        className="fixed bottom-6 right-4 z-50 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-lg flex items-center justify-center text-white text-2xl transition-colors active:scale-95"
      >
        ⚄
      </button>

      <BottomSheet
        isOpen={isDiceCalculatorOpen}
        onClose={closeDiceCalculator}
        title="Dice Calculator"
      >
        <DiceCalculator />
      </BottomSheet>
    </>
  )
}
