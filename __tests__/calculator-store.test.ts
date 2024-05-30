import '@testing-library/jest-dom'
import { initCalculatorStore, createCalculatorStore } from '@/stores/calculator-store';
import { FortyTwoProject, ExpandedFortyTwoProject } from '@/types/forty-two';
import { initFortyTwoStore } from '@/stores/forty-two-store';
import { fortyTwoStore } from '@/providers/forty-two-store-provider';

describe('Calculator Store', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let store: any;

  const project: FortyTwoProject = {
    id: 1,
    name: 'Test Project',
    experience: 100,
  }

  const expandedProject: ExpandedFortyTwoProject = {
    ...project,
    addedAt: 0,
    experience: {
      base: 100,
      gained: 100
    },
    level: 0.00,
    mark: 100,
    bonus: false
  };

  const levels = {
    1: {
      level: 1,
      experience: 100,
    },
    2: {
      level: 2,
      experience: 200,
    },
    3: {
      level: 3,
      experience: 300,
    }
  }

  fortyTwoStore.setState(
    initFortyTwoStore({ levels, projects: {} })
  )

  beforeEach(() => {
    const initState = initCalculatorStore({
      level: 1.00,
    });

    store = createCalculatorStore(initState);
  });

  it('should add a project correctly', () => {
    store.getState().addProject(project);

    expect(store.getState().experience.end).toEqual(200)
    expect(store.getState().level.end).toEqual(2.00)
  });

  it('should update a project correctly', () => {
    const updatedProject: ExpandedFortyTwoProject = {
      ...expandedProject,
      mark: 125
    };

    store.getState().addProject(project);
    store.getState().updateProject(updatedProject);

    expect(store.getState().experience.end).toEqual(225);
    expect(store.getState().level.end).toEqual(2.25);
  });

  it('should remove a project correctly', () => {
    store.getState().addProject(project);
    store.getState().removeProject(project.id);

    expect(store.getState().projects[project.id]).toBeUndefined();
    expect(store.getState().experience.end).toEqual(100);
    expect(store.getState().level.end).toEqual(1.00);
  });
});
