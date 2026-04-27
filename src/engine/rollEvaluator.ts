import { math, buildStatScope } from '../lib/math'
import type { Stat } from '../types/stat'

export interface RollResult {
  total: number
  breakdown: string
  rolls: { dice: string; result: number; individual: number[] }[]
}

export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1
}

/**
 * Evaluates a roll formula, replacing XdY tokens with actual random rolls
 * and stat references with their current values.
 */
export function evaluateRoll(formula: string, stats: Stat[]): RollResult {
  const rolls: { dice: string; result: number; individual: number[] }[] = []
  const scope = buildStatScope(stats)

  // Replace all XdY tokens with random rolls, tracking each roll
  const processedFormula = formula.replace(/(\d+)d(\d+)/gi, (_match, count, sides) => {
    const x = parseInt(count, 10)
    const y = parseInt(sides, 10)
    let total = 0
    const individualRolls: number[] = []

    for (let i = 0; i < x; i++) {
      const roll = rollDie(y)
      individualRolls.push(roll)
      total += roll
    }

    const diceLabel = `${x}d${y}`
    rolls.push({ dice: diceLabel, result: total, individual: individualRolls })

    return `(${total})`
  })

  // Build breakdown parts showing stat substitutions
  let breakdownFormula = formula
  // Replace dice tokens in breakdown with their results
  let rollIndex = 0
  breakdownFormula = breakdownFormula.replace(/(\d+)d(\d+)/gi, (_match, count, sides) => {
    const entry = rolls[rollIndex++]
    return entry ? `${count}d${sides}(${entry.result})` : _match
  })

  // Substitute stat names in breakdown with their values
  const statNamesSorted = Object.keys(scope).sort((a, b) => b.length - a.length)
  for (const key of statNamesSorted) {
    const regex = new RegExp(`\\b${key}\\b`, 'g')
    breakdownFormula = breakdownFormula.replace(regex, `${key}(${scope[key]})`)
  }

  // Evaluate the arithmetic result
  let total = 0
  try {
    const result = math.evaluate(processedFormula, scope)
    total = typeof result === 'number' ? result : Number(result)
    if (isNaN(total)) total = 0
  } catch {
    total = 0
  }

  const breakdown = `${breakdownFormula} = ${total}`

  return { total, breakdown, rolls }
}
