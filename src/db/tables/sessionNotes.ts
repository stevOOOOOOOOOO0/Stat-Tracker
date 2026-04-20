import { db } from '../index'
import type { SessionNote } from '../../types/session'

export async function getSessionNotes(campaignId: string): Promise<SessionNote[]> {
  return db.sessionNotes.where('campaignId').equals(campaignId).toArray()
}

export async function createSessionNote(data: SessionNote): Promise<void> {
  await db.sessionNotes.put(data)
}

export async function updateSessionNote(id: string, data: Partial<SessionNote>): Promise<void> {
  await db.sessionNotes.update(id, data)
}

export async function deleteSessionNote(id: string): Promise<void> {
  await db.sessionNotes.delete(id)
}
