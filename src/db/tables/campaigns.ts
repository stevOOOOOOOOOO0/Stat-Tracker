import { db } from '../index'
import type { Campaign } from '../../types/campaign'

export async function getCampaigns(): Promise<Campaign[]> {
  return db.campaigns.toArray()
}

export async function getCampaign(id: string): Promise<Campaign | undefined> {
  return db.campaigns.get(id)
}

export async function createCampaign(data: Campaign): Promise<void> {
  await db.campaigns.put(data)
}

export async function updateCampaign(id: string, data: Partial<Campaign>): Promise<void> {
  await db.campaigns.update(id, data)
}

export async function deleteCampaign(id: string): Promise<void> {
  await db.campaigns.delete(id)
}
