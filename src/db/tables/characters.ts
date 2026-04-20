import { db } from '../index'
import type { Character } from '../../types/character'

export async function getCharactersByCampaign(campaignId: string): Promise<Character[]> {
  return db.characters.where('campaignId').equals(campaignId).toArray()
}

export async function getCharacter(id: string): Promise<Character | undefined> {
  return db.characters.get(id)
}

export async function createCharacter(data: Character): Promise<void> {
  await db.characters.put(data)
}

export async function updateCharacter(id: string, data: Partial<Character>): Promise<void> {
  await db.characters.update(id, data)
}

export async function deleteCharacter(id: string): Promise<void> {
  await db.characters.delete(id)
}
