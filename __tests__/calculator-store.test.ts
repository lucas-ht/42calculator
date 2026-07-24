import {
  createCalculatorStore,
  initCalculatorStore,
} from '@/stores/calculator-store'
import type {
  CalculatorEntry,
  FortyTwoLevel,
  FortyTwoProject,
} from '@/types/forty-two'
import type { StoreApi } from 'zustand'
import type { CalculatorStore } from '@/stores/calculator-store'
import '@testing-library/jest-dom'

describe('Calculator Store', () => {
  let store: StoreApi<CalculatorStore>

  const project: FortyTwoProject = {
    id: 1,
    name: 'Test Project',
    experience: 100,
    children: [],
    completions: 0,
    duration: 0,
  }

  const levels: Record<number, FortyTwoLevel> = {
    1: { level: 1, experience: 100 },
    2: { level: 2, experience: 200 },
    3: { level: 3, experience: 300 },
  }

  // Starting level of the (fake) cursus used to seed the calculator.
  const startLevel = 1.0

  beforeEach(() => {
    const initState = initCalculatorStore(startLevel, levels)
    store = createCalculatorStore(initState, levels)
  })

  it('should add a project correctly', () => {
    store.getState().addProject(project)

    expect(store.getState().experience.end).toEqual(200)
    expect(store.getState().level.end).toEqual(2.0)
  })

  it('should update a project correctly', () => {
    store.getState().addProject(project)

    const entry = store.getState().entries[project.id]
    const updated: CalculatorEntry = {
      ...entry,
      project: { ...entry.project, mark: 125 },
    }
    store.getState().updateProject(updated)

    expect(store.getState().experience.end).toEqual(225)
    expect(store.getState().level.end).toEqual(2.25)
  })

  it('should seed a project with a stored config (survives reload)', () => {
    // Mirrors CalculatorPlanSeed re-seeding from the persisted plan: a stored
    // mark must be applied instead of resetting to 100.
    store.getState().addProject(project, { mark: 125, bonus: false })

    expect(store.getState().entries[project.id].project.mark).toEqual(125)
    expect(store.getState().experience.end).toEqual(225)
    expect(store.getState().level.end).toEqual(2.25)
  })

  it('should remove a project correctly', () => {
    store.getState().addProject(project)
    store.getState().removeProject(project.id)

    expect(store.getState().entries[project.id]).toBeUndefined()
    expect(store.getState().experience.end).toEqual(100)
    expect(store.getState().level.end).toEqual(1.0)
  })
})
