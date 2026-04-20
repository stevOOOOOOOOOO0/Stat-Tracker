import { create } from 'zustand'
import type { Campaign } from '../types/campaign'
import {
  getCampaigns,
  getCampaign as dbGetCampaign,
  createCampaign as dbCreateCampaign,
  updateCampaign as dbUpdateCampaign,
  deleteCampaign as dbDeleteCampaign,
} from '../db/tables/campaigns'
import { generateId } from '../lib/ids'
import { now } from '../lib/dates'

interface CampaignState {
  campaigns: Campaign[]
  activeCampaignId: string | null

  loadCampaigns: () => Promise<void>
  setActiveCampaign: (id: string | null) => void
  createCampaign: (data: Partial<Campaign>) => Promise<Campaign>
  updateCampaign: (id: string, data: Partial<Campaign>) => Promise<void>
  deleteCampaign: (id: string) => Promise<void>
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: [],
  activeCampaignId: null,

  loadCampaigns: async () => {
    const campaigns = await getCampaigns()
    set({ campaigns })
  },

  setActiveCampaign: (id) => {
    set({ activeCampaignId: id })
  },

  createCampaign: async (data) => {
    const timestamp = now()
    const campaign: Campaign = {
      id: generateId(),
      name: data.name ?? 'Untitled Campaign',
      system: data.system ?? 'Generic',
      memberIds: data.memberIds ?? [],
      characterIds: data.characterIds ?? [],
      createdAt: timestamp,
      updatedAt: timestamp,
      ...data,
    }
    // Update state first (optimistic)
    set(state => ({ campaigns: [...state.campaigns, campaign] }))
    // Persist to Dexie (fire and forget)
    dbCreateCampaign(campaign)
    return campaign
  },

  updateCampaign: async (id, data) => {
    const updated = { ...data, updatedAt: now() }
    set(state => ({
      campaigns: state.campaigns.map(c =>
        c.id === id ? { ...c, ...updated } : c
      ),
    }))
    dbUpdateCampaign(id, updated)
  },

  deleteCampaign: async (id) => {
    set(state => ({
      campaigns: state.campaigns.filter(c => c.id !== id),
      activeCampaignId: state.activeCampaignId === id ? null : state.activeCampaignId,
    }))
    dbDeleteCampaign(id)
  },
}))

export function selectActiveCampaign(state: CampaignState): Campaign | null {
  if (!state.activeCampaignId) return null
  return state.campaigns.find(c => c.id === state.activeCampaignId) ?? null
}
