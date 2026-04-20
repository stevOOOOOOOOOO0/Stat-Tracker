import { useCampaignStore, selectActiveCampaign } from '../store/campaignStore'

export function useCampaign() {
  const campaigns = useCampaignStore(state => state.campaigns)
  const campaign = useCampaignStore(selectActiveCampaign)
  const setActiveCampaign = useCampaignStore(state => state.setActiveCampaign)
  const createCampaign = useCampaignStore(state => state.createCampaign)
  const updateCampaign = useCampaignStore(state => state.updateCampaign)
  const deleteCampaign = useCampaignStore(state => state.deleteCampaign)
  const loadCampaigns = useCampaignStore(state => state.loadCampaigns)

  return {
    campaign,
    campaigns,
    setActiveCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    loadCampaigns,
  }
}
