export enum FortyTwoCursusId {
  MAIN = 21
}

export interface FortyTwoProject {
  id: number
  name: string
  experience: number
}

export interface ExpandedFortyTwoProject
  extends Omit<FortyTwoProject, 'experience'> {
  addedAt: number
  experience: {
    base: number
    gained: number
  }
  level: number
  mark: number
  bonus: boolean
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
