import { FortyTwoProject } from './project'

export interface FortyTwoTitleOption {
  title: string
  experience: number
  numberOfProjects: number

  projects: Record<number, FortyTwoProject>
}

export interface FortyTwoTitle {
  type: string
  title: string
  level: number

  numberOfEvents: number
  numberOfExperiences: number
  numberOfSuite: number

  options: Array<FortyTwoTitleOption>

  suite: Record<number, FortyTwoProject>
  experience: Record<number, FortyTwoProject>
}
