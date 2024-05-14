import { create } from 'zustand'

import {
  calculateExperience,
  getExperience,
  getLevel
} from '@/lib/forty-two-experience'
import { FortyTwoProject } from '@/types/forty-two'

type CalculatorStore = {
  experience: number
  level: number
  projects: Record<number, FortyTwoProject>

  setLevel: (level: number) => Promise<void>
  addProject: (project: FortyTwoProject) => Promise<void>
  updateProject: (project: FortyTwoProject) => Promise<void>
  removeProject: (projectId: number) => Promise<void>
}

export const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  level: 0,
  experience: 0,
  projects: {},

  setLevel: async (level) => {
    const experience = await getExperience(level)

    set(() => ({
      experience,
      level
    }))
  },

  addProject: async (project) => {
    const state = get()

    const experience =
      state.experience +
      (await calculateExperience(
        project.experience,
        project.final_mark ?? 0,
        project.bonus_coalition ?? false
      ))

    const level = await getLevel(experience)

    set(() => ({
      experience,
      level,
      projects: { ...state.projects, [project.id]: project }
    }))
  },

  updateProject: async (project) => {
    const state = get()

    const previousProject = state.projects[project.id]
    if (previousProject == null) {
      return
    }

    const experience =
      state.experience -
      (await calculateExperience(
        previousProject.experience,
        previousProject.final_mark ?? 0,
        previousProject.bonus_coalition ?? false
      )) +
      (await calculateExperience(
        project.experience,
        project.final_mark ?? 0,
        project.bonus_coalition ?? false
      ))

    const level = await getLevel(experience)

    set(() => ({
      experience,
      level,
      projects: { ...state.projects, [project.id]: project }
    }))
  },

  removeProject: async (projectID) => {
    const state = get()

    const project = state.projects[projectID]
    if (project == null) {
      return
    }

    const experience =
      state.experience -
      (await calculateExperience(
        project.experience,
        project.final_mark ?? 0,
        project.bonus_coalition ?? false
      ))

    const level = await getLevel(experience)

    delete state.projects[projectID]

    set(() => ({
      experience,
      level,
      projects: { ...state.projects }
    }))
  }
}))
