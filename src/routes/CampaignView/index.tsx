import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { PageHeader } from '../../components/layout/PageHeader'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { SearchOverlay } from '../../components/overlays/SearchOverlay'
import { useUIStore } from '../../store/uiStore'
import { useCampaign } from '../../hooks/useCampaign'
import { CampaignCard } from './CampaignCard'
import { CreateCampaignSheet } from './CreateCampaignSheet'

export default function CampaignView() {
  const navigate = useNavigate()
  const { campaigns, loadCampaigns } = useCampaign()
  const openSearch = useUIStore((state) => state.openSearch)

  const [isLoading, setIsLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  useEffect(() => {
    loadCampaigns().finally(() => setIsLoading(false))
  }, [loadCampaigns])

  function handleCardClick(id: string) {
    navigate(`/campaigns/${id}`)
  }

  const searchButton = (
    <button
      type="button"
      onClick={openSearch}
      aria-label="Open search"
      className="inline-flex items-center justify-center w-10 h-10 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
        />
      </svg>
    </button>
  )

  return (
    <AppShell>
      <div className="flex flex-col h-full">
        <PageHeader title="My Campaigns" actions={searchButton} />

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : campaigns.length === 0 ? (
            <EmptyState
              icon={
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                  />
                </svg>
              }
              title="No campaigns yet"
              description="Create your first campaign to get started"
              action={
                <Button variant="primary" onClick={() => setIsSheetOpen(true)}>
                  Create Campaign
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onClick={() => handleCardClick(campaign.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* FAB */}
        <button
          type="button"
          onClick={() => setIsSheetOpen(true)}
          aria-label="Create campaign"
          className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shadow-lg z-30"
        >
          +
        </button>

        <CreateCampaignSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
        />

        <SearchOverlay />
      </div>
    </AppShell>
  )
}
