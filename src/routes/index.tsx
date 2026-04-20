import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import CampaignView from './CampaignView/index'
import CharacterListView from './CharacterListView/index'
import CharacterSheetView from './CharacterSheetView/index'

export const router = createBrowserRouter([
  { path: '/', element: <CampaignView /> },
  { path: '/campaigns/:campaignId', element: <CharacterListView /> },
  {
    path: '/campaigns/:campaignId/characters/:characterId',
    element: <CharacterSheetView />,
  },
])
