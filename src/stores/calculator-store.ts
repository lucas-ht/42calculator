import {
  calculateExperience,
  getExperience,
  getLevel
} from '@/lib/forty-two/forty-two-calculator'
import { fortyTwoStore } from '@/providers/forty-two-store-provider'
import { FortyTwoProject, FortyTwoProjectCalculator } from '@/types/forty-two'
import { createStore } from 'zustand/vanilla'

export type CalculatorState = {
  level: {
    start: number
    end: number
  }
  experience: {
    start: number
    end: number
  }
  projects: Record<number, FortyTwoProjectCalculator>
}

export type CalculatorActions = {
  getProjects: () => Array<FortyTwoProjectCalculator>
  setLevel: (level: number) => void
  addProject: (newProject: FortyTwoProject) => void
  updateProject: (updateProject: FortyTwoProjectCalculator) => void
  removeProject: (projectId: number) => void
}

export type CalculatorStore = CalculatorState & CalculatorActions

export type CalculatorStoreInitProps = {
  level: number
}

export const initCalculatorStore = ({
  level
}: CalculatorStoreInitProps): CalculatorState => {
  const { levels } = fortyTwoStore.getState()
  const experience = getExperience(level, levels)

  return {
    ...defaultInitState,
    level: {
      start: level,
      end: level
    },
    experience: {
      start: experience,
      end: experience
    }
  }
}

export const defaultInitState: CalculatorState = {
  level: {
    start: 0,
    end: 0
  },
  experience: {
    start: 0,
    end: 0
  },
  projects: {}
}

export const createCalculatorStore = (
  initState: CalculatorState = defaultInitState
) => {
  return createStore<CalculatorStore>()((set, get) => {
    const recalculateLevels = () => {
      const state = get()
      const { levels } = fortyTwoStore.getState()

      let experience = state.experience.start

      const projects = Object.values(state.projects).sort(
        (a, b) => a.addedAt - b.addedAt
      )

      const updatedProjects = projects.map((project) => {
        experience += project.experience.gained
        const level = getLevel(experience, levels)

        return {
          [project.id]: {
            ...project,
            level: level
          }
        }
      })

      set(() => ({
        projects: {
          ...state.projects,
          ...Object.assign({}, ...updatedProjects)
        },
        experience: { ...state.experience, end: experience },
        level: { ...state.level, end: getLevel(experience, levels) }
      }))
    }

    return {
      ...initState,

      getProjects: () => {
        const state = get()

        return Object.values(state.projects).sort(
          (a, b) => a.addedAt - b.addedAt
        )
      },

      setLevel: (level: number) => {
        const state = get()
        const { levels } = fortyTwoStore.getState()

        if (state.level.start === level) {
          return
        }

        set(() => ({
          level: {
            ...state.level,
            start: level
          },
          experience: {
            ...state.experience,
            start: getExperience(level, levels)
          }
        }))

        recalculateLevels()
      },

      addProject: (newProject: FortyTwoProject) => {
        const state = get()
        const { levels } = fortyTwoStore.getState()

        if (state.projects[newProject.id] != null) {
          return
        }

        const experience_gained = calculateExperience(
          newProject.experience ?? 0,
          100,
          false
        )

        const new_level = getLevel(
          state.experience.end + experience_gained,
          levels
        )

        const project: FortyTwoProjectCalculator = {
          ...newProject,
          addedAt: Date.now(),
          experience: {
            base: newProject.experience ?? 0,
            gained: experience_gained
          },
          level: new_level,
          mark: 100,
          bonus: false
        }

        set(() => ({
          level: {
            ...state.level,
            end: new_level
          },
          experience: {
            ...state.experience,
            end: state.experience.end + experience_gained
          },
          projects: { ...state.projects, [project.id]: project }
        }))
      },

      updateProject: (updatedProject: FortyTwoProjectCalculator) => {
        const state = get()

        if (state.projects[updatedProject.id] == null) {
          return
        }

        const experience_gained = calculateExperience(
          updatedProject.experience.base,
          updatedProject.mark ?? 0,
          updatedProject.bonus ?? false
        )

        const project: FortyTwoProjectCalculator = {
          ...updatedProject,
          experience: {
            ...updatedProject.experience,
            gained: experience_gained
          }
        }

        set(() => ({
          projects: { ...state.projects, [project.id]: project }
        }))

        recalculateLevels()
      },

      removeProject: (projectID: number) => {
        const state = get()

        const project = state.projects[projectID]
        if (project == null) {
          return
        }

        delete state.projects[projectID]

        set(() => ({
          projects: { ...state.projects }
        }))

        recalculateLevels()
      }
    }
  })
}
