export enum FortyTwoCursusId {
  MAIN = 21
}

export interface FortyTwoProject {
  id: number
  name: string
  experience: number
  final_mark?: number
  bonus_coalition?: boolean
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
}
