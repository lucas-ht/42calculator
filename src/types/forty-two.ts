export enum FortyTwoCursusId {
  MAIN = 21
}

export interface FortyTwoProject {
  id: number
  name: string
  experience: number
  final_mark: number | undefined
  bonus_coalition: boolean | undefined
}

export interface FortyTwoLevel {
  level: number
  experience: number
}

export interface FortyTwoCursus {
  id: number
  name: string
  slug: string
  level: number
  experience: number | undefined
  projects: FortyTwoProject[]
}
