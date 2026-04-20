export interface SessionNote {
  id: string
  campaignId: string
  title: string
  body: string
  tags: string[]
  sessionLabel?: string
  createdAt: string
  updatedAt: string
}
