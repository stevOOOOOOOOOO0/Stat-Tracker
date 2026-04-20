export interface Campaign {
  id: string
  name: string
  system: string
  coverImageUrl?: string
  ownerId?: string
  memberIds: string[]
  inviteCode?: string
  characterIds: string[]
  createdAt: string
  updatedAt: string
}
