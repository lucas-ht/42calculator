import { fortyTwoStore } from '@/providers/forty-two-store-provider'
import {
  createCalculatorStore,
  initCalculatorStore
} from '@/stores/calculator-store'
import { initFortyTwoStore } from '@/stores/forty-two-store'
import {
  FortyTwoCursus,
  FortyTwoProject,
  FortyTwoProjectCalculator
} from '@/types/forty-two'
import '@testing-library/jest-dom'

describe('Calculator Store', () => {
  let store: any

  const project: FortyTwoProject = {
    id: 1,
    name: 'Test Project',
    experience: 100
  }

  const expandedProject: FortyTwoProjectCalculator = {
    ...project,
    addedAt: 0,
    experience: {
      base: 100,
      gained: 100
    },
    level: 0.0,
    mark: 100,
    bonus: false
  }

  const levels = {
    1: {
      level: 1,
      experience: 100
    },
    2: {
      level: 2,
      experience: 200
    },
    3: {
      level: 3,
      experience: 300
    }
  }

  const cursus: FortyTwoCursus = {
    id: 0,
    name: 'Test Cursus',
    slug: 'test-cursus',
    level: 1.0,
    events: 0,
    projects: {}
  }

  fortyTwoStore.setState(initFortyTwoStore({ cursus, levels, projects: {} }))

  beforeEach(() => {
    const initState = initCalculatorStore()

    store = createCalculatorStore(initState)
  })

  it('should add a project correctly', () => {
    store.getState().addProject(project)

    expect(store.getState().experience.end).toEqual(200)
    expect(store.getState().level.end).toEqual(2.0)
  })

  it('should update a project correctly', () => {
    const updatedProject: FortyTwoProjectCalculator = {
      ...expandedProject,
      mark: 125
    }

    store.getState().addProject(project)
    store.getState().updateProject(updatedProject)

    expect(store.getState().experience.end).toEqual(225)
    expect(store.getState().level.end).toEqual(2.25)
  })

  it('should remove a project correctly', () => {
    store.getState().addProject(project)
    store.getState().removeProject(project.id)

    expect(store.getState().projects[project.id]).toBeUndefined()
    expect(store.getState().experience.end).toEqual(100)
    expect(store.getState().level.end).toEqual(1.0)
  })
})
