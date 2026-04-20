import { useDiceStore } from '../store/diceStore'
import type { Stat } from '../types/stat'

export function useDice() {
  const formula = useDiceStore(state => state.formula)
  const history = useDiceStore(state => state.history)
  const setFormula = useDiceStore(state => state.setFormula)
  const rollFormula = useDiceStore(state => state.rollFormula)
  const rollQuick = useDiceStore(state => state.rollQuick)

  return {
    formula,
    history,
    setFormula,
    rollFormula: (stats?: Stat[]) => rollFormula(stats),
    rollQuick,
  }
}
