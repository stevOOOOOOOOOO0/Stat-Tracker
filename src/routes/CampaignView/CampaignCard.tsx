import React from 'react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { formatRelative } from '../../lib/dates'
import type { Campaign } from '../../types/campaign'

export interface CampaignCardProps {
  campaign: Campaign
  onClick: () => void
}

export function CampaignCard({ campaign, onClick }: CampaignCardProps) {
  return (
    <Card onClick={onClick} pressable className="mb-3 p-0 overflow-hidden">
      {/* Cover image strip */}
      {campaign.coverImageUrl ? (
        <img
          src={campaign.coverImageUrl}
          alt={campaign.name}
          className="w-full h-24 object-cover"
        />
      ) : (
        <div className="w-full h-24 bg-gradient-to-br from-indigo-900 to-slate-800" />
      )}

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2">
        {/* Campaign name */}
        <h2 className="text-xl font-bold text-slate-100 truncate">{campaign.name}</h2>

        {/* System badge + member count */}
        <div className="flex items-center gap-2">
          <Badge variant="indigo">{campaign.system}</Badge>
          <span className="text-slate-400 text-sm">
            {campaign.memberIds.length} member{campaign.memberIds.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Last updated */}
        <p className="text-slate-500 text-xs">
          Last updated {formatRelative(campaign.updatedAt)}
        </p>
      </div>
    </Card>
  )
}
