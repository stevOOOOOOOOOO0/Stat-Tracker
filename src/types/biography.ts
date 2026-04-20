export interface BiographySection {
  id: string
  title: string
  body: string
  order: number
}

export interface Biography {
  characterId: string
  sections: BiographySection[]
}
