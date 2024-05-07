declare module 'forty-two' {
  enum FortyTwoCursusId {
    MAIN = 21
  }

  interface FortyTwoProject {
    id: number
    name: string
    experience: number
    final_mark: number | undefined
    bonus_coalition: boolean | undefined
  }

  interface FortyTwoCursusProject
    extends Omit<FortyTwoProject, 'name', 'experience', 'bonus_coalition'> {}

  interface FortyTwoCursus {
    id: number
    level: number
    experience: number | undefined
    projects: FortyTwoCursusProject[]
  }
}
