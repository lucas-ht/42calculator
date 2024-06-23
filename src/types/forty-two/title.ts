import { FortyTwoProject } from './project'

export enum FortyTwoTitleType {
  RNCP_6 = 'rncp-6',
  RNCP_7 = 'rncp-7'
}

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
