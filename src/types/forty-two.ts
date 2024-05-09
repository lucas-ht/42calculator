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

export interface FortyTwoCursusProject
  extends Omit<FortyTwoProject, 'name' | 'experience' | 'bonus_coalition'> {}

export interface FortyTwoCursus {
  id: number
  level: number
  experience: number | undefined
  projects: FortyTwoCursusProject[]
}
