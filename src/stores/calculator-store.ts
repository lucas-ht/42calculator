import { FortyTwoLevel, FortyTwoProject } from '@/types/forty-two'
import { createStore } from 'zustand/vanilla'

import {
  calculateExperience,
  getExperience,
  getLevel
} from '@/lib/forty-two-calculator'

export type CalculatorState = {
  level: number
  experience: number
  projects: Record<number, FortyTwoProject>
  levels: Record<number, FortyTwoLevel>
}

export type CalculatorActions = {
  addProject: (project: FortyTwoProject) => void
  updateProject: (project: FortyTwoProject) => void
  removeProject: (projectId: number) => void
}

export type CalculatorStore = CalculatorState & CalculatorActions

export type CalculatorStoreInitProps = {
  level: number
  levels: Record<number, FortyTwoLevel>
}

export const initCalculatorStore = ({
  level,
  levels
}: CalculatorStoreInitProps): CalculatorState => {
  const experience = getExperience(level, levels)
  return { ...defaultInitState, level, levels, experience }
}

export const defaultInitState: CalculatorState = {
  level: 0,
  experience: 0,
  projects: {},
  levels: {}
}

export const createCalculatorStore = (
  initState: CalculatorState = defaultInitState
) => {
  return createStore<CalculatorStore>()((set, get) => ({
    ...initState,

    addProject: (project) => {
      const state = get()

      const experience =
        state.experience +
        calculateExperience(
          project.experience,
          project.final_mark ?? 0,
          project.bonus_coalition ?? false
        )

      const level = getLevel(experience, state.levels)

      set(() => ({
        experience,
        level,
        projects: { ...state.projects, [project.id]: project }
      }))
    },

    updateProject: (project) => {
      const state = get()

      const previousProject = state.projects[project.id]
      if (previousProject == null) {
        return
      }

      const experience =
        state.experience -
        calculateExperience(
          previousProject.experience,
          previousProject.final_mark ?? 0,
          previousProject.bonus_coalition ?? false
        ) +
        calculateExperience(
          project.experience,
          project.final_mark ?? 0,
          project.bonus_coalition ?? false
        )

      const level = getLevel(experience, state.levels)

      set(() => ({
        experience,
        level,
        projects: { ...state.projects, [project.id]: project }
      }))
    },

    removeProject: (projectID) => {
      const state = get()

      const project = state.projects[projectID]
      if (project == null) {
        return
      }

      const experience =
        state.experience -
        calculateExperience(
          project.experience,
          project.final_mark ?? 0,
          project.bonus_coalition ?? false
        )

      const level = getLevel(experience, state.levels)

      delete state.projects[projectID]

      set(() => ({
        experience,
        level,
        projects: { ...state.projects }
      }))
    }
  }))
}
