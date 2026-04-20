import { math, buildStatScope } from '../lib/math'
import type { Stat } from '../types/stat'

export interface FormulaResult {
  value: number
  error?: string
}

/**
 * Replaces XdY dice notation tokens with their average value: (X * Y) / 2 + X / 2
 * e.g. 2d6 -> (2*6)/2 + 2/2 = 7
 */
function replaceDiceWithAverage(formula: string): string {
  return formula.replace(/(\d+)d(\d+)/gi, (_match, count, sides) => {
    const x = parseInt(count, 10)
    const y = parseInt(sides, 10)
    const average = (x * y) / 2 + x / 2
    return `(${average})`
  })
}

/**
 * Evaluates a formula string against a list of stats.
 * Dice notation (XdY) is replaced with average values for display purposes.
 */
export function evaluateFormula(formula: string, stats: Stat[]): FormulaResult {
  try {
    const scope = buildStatScope(stats)
    const processedFormula = replaceDiceWithAverage(formula)
    const result = math.evaluate(processedFormula, scope)
    const value = typeof result === 'number' ? result : Number(result)
    if (isNaN(value)) {
      return { value: 0, error: 'Formula result is not a number' }
    }
    return { value }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { value: 0, error: message }
  }
}

/**
 * Returns a preview string showing the formula with stat names substituted
 * with their current values, e.g. "floor((18 - 10) / 2) = 4"
 */
export function previewFormula(formula: string, stats: Stat[]): string {
  const scope = buildStatScope(stats)
  let substituted = formula

  // Sort by name length descending to avoid partial replacements
  const statNamesSorted = Object.keys(scope).sort((a, b) => b.length - a.length)
  for (const key of statNamesSorted) {
    const regex = new RegExp(`\\b${key}\\b`, 'g')
    substituted = substituted.replace(regex, String(scope[key]))
  }

  try {
    const processedFormula = replaceDiceWithAverage(substituted)
    const result = math.evaluate(processedFormula, {})
    const value = typeof result === 'number' ? result : Number(result)
    if (!isNaN(value)) {
      return `${substituted} = ${value}`
    }
  } catch {
    // fall through to return substituted only
  }

  return substituted
}
