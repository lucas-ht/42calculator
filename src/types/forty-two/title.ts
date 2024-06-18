import { FortyTwoProject } from './project'

export interface FortyTwoTitleOption {
  title: string
  experience: number
  numberOfProjects: number

  projects: FortyTwoProject[]
}

export interface FortyTwoTitle {
  type: string
  title: string
  level: number

  numberOfEvents: number
  numberOfExperiences: number
  numberOfSuite: number

  options: FortyTwoTitleOption[]

  suite: FortyTwoProject[]
  experience: FortyTwoProject[]
}
