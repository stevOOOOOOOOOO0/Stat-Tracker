import { db } from '../index'
import type { Condition } from '../../types/condition'
import { DEFAULT_CONDITIONS } from '../seeds/conditionLibrary'

export async function getConditionLibrary(): Promise<Condition[]> {
  return db.conditions.where('isLibraryEntry').equals(1).toArray()
}

export async function createCondition(data: Condition): Promise<void> {
  await db.conditions.put(data)
}

export async function updateCondition(id: string, data: Partial<Condition>): Promise<void> {
  await db.conditions.update(id, data)
}

export async function deleteCondition(id: string): Promise<void> {
  await db.conditions.delete(id)
}

export async function seedConditionLibrary(): Promise<void> {
  const existing = await db.conditions.where('isLibraryEntry').equals(1).count()
  if (existing === 0) {
    await db.conditions.bulkPut(DEFAULT_CONDITIONS)
  }
}
