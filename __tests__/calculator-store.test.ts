import '@testing-library/jest-dom'
import { initCalculatorStore, createCalculatorStore } from '@/stores/calculator-store';
import { FortyTwoProject } from '@/types/forty-two';

describe('Calculator Store', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let store: any;

  const project = {
    id: 1,
    name: 'Test Project',
    experience: 100,
    final_mark: 100,
    bonus_coalition: false
  };

  beforeEach(() => {
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

    const initState = initCalculatorStore({
      level: 1.00,
      levels: levels,
      projects: {}
    });

    store = createCalculatorStore(initState);
  });

  it('should add a project correctly', () => {
    store.getState().addProject(project);

    expect(store.getState().projects[1]).toEqual(project)
    expect(store.getState().experience).toEqual(200)
    expect(store.getState().level).toEqual(2.00)
  });

  it('should update a project correctly', () => {
    const updatedProject: FortyTwoProject = {
      ...project,
      final_mark: 125
    };

    store.getState().addProject(project);
    store.getState().updateProject(updatedProject);

    expect(store.getState().projects[1]).toEqual(updatedProject);
    expect(store.getState().experience).toEqual(225);
    expect(store.getState().level).toEqual(2.25);
  });

  it('should remove a project correctly', () => {
    store.getState().addProject(project);
    store.getState().removeProject(project.id);

    expect(store.getState().projects[project.id]).toBeUndefined();
    expect(store.getState().experience).toEqual(100);
    expect(store.getState().level).toEqual(1.00);
  });
});
