import {
  calculateExperience,
  getExperience,
  getLevel,
} from "@/lib/forty-two/forty-two-calculator";
import { fortyTwoStore } from "@/providers/forty-two-store-provider";
import type {
  FortyTwoProject,
  FortyTwoProjectCalculator,
} from "@/types/forty-two";
import { createStore } from "zustand/vanilla";

export type CalculatorState = {
  level: {
    start: number;
    end: number;
  };
  experience: {
    start: number;
    end: number;
  };
  projects: Record<number, FortyTwoProjectCalculator>;
};

export type CalculatorActions = {
  getProjects: () => FortyTwoProjectCalculator[];
  setLevel: (level: number) => void;
  addProject: (newProject: FortyTwoProject) => void;
  updateProject: (updateProject: FortyTwoProjectCalculator) => void;
  removeProject: (projectId: number) => void;
};

export type CalculatorStore = CalculatorState & CalculatorActions;

export const initCalculatorStore = (): CalculatorState => {
  const {
    cursus: { level },
    levels,
  } = fortyTwoStore.getState();
  const experience = getExperience(level, levels);

  return {
    ...defaultInitState,
    level: {
      start: level,
      end: level,
    },
    experience: {
      start: experience,
      end: experience,
    },
  };
};

export const defaultInitState: CalculatorState = {
  level: {
    start: 0,
    end: 0,
  },
  experience: {
    start: 0,
    end: 0,
  },
  projects: {},
};

export const createCalculatorStore = (
  initState: CalculatorState = defaultInitState,
) => {
  return createStore<CalculatorStore>()((set, get) => {
    const recalculateLevels = () => {
      const state = get();
      const { levels } = fortyTwoStore.getState();

      let experience = state.experience.start;

      const projects = Object.values(state.projects).sort(
        (a, b) => a.addedAt - b.addedAt,
      );

      const updatedProjects = projects.map((project) => {
        experience += project.experience.gained;
        const level = getLevel(experience, levels);

        return {
          [project.id]: {
            ...project,
            level: level,
          },
        };
      });

      set(() => ({
        projects: {
          ...state.projects,
          ...Object.assign({}, ...updatedProjects),
        },
        experience: { ...state.experience, end: experience },
        level: { ...state.level, end: getLevel(experience, levels) },
      }));
    };

    return {
      ...initState,

      getProjects: () => {
        const state = get();

        return Object.values(state.projects).sort(
          (a, b) => a.addedAt - b.addedAt,
        );
      },

      setLevel: (level: number) => {
        const state = get();
        const { levels } = fortyTwoStore.getState();

        if (state.level.start === level) {
          return;
        }

        set(() => ({
          level: {
            ...state.level,
            start: level,
          },
          experience: {
            ...state.experience,
            start: getExperience(level, levels),
          },
        }));

        recalculateLevels();
      },

      addProject: (newProject: FortyTwoProject) => {
        const state = get();
        const { levels } = fortyTwoStore.getState();

        if (state.projects[newProject.id] != null) {
          return;
        }

        const experienceGained = calculateExperience(
          newProject.experience ?? 0,
          100,
          false,
        );

        const newLevel = getLevel(
          state.experience.end + experienceGained,
          levels,
        );

        const project: FortyTwoProjectCalculator = {
          ...newProject,
          addedAt: Date.now(),
          experience: {
            base: newProject.experience ?? 0,
            gained: experienceGained,
          },
          level: newLevel,
          mark: 100,
          bonus: false,
        };

        set(() => ({
          level: {
            ...state.level,
            end: newLevel,
          },
          experience: {
            ...state.experience,
            end: state.experience.end + experienceGained,
          },
          projects: { ...state.projects, [project.id]: project },
        }));
      },

      updateProject: (updatedProject: FortyTwoProjectCalculator) => {
        const state = get();

        if (state.projects[updatedProject.id] == null) {
          return;
        }

        const experienceGained = calculateExperience(
          updatedProject.experience.base,
          updatedProject.mark ?? 0,
          updatedProject.bonus ?? false,
        );

        const project: FortyTwoProjectCalculator = {
          ...updatedProject,
          experience: {
            ...updatedProject.experience,
            gained: experienceGained,
          },
        };

        set(() => ({
          projects: { ...state.projects, [project.id]: project },
        }));

        recalculateLevels();
      },

      removeProject: (projectId: number) => {
        const state = get();

        const project = state.projects[projectId];
        if (project == null) {
          return;
        }

        delete state.projects[projectId];

        set(() => ({
          projects: { ...state.projects },
        }));

        recalculateLevels();
      },
    };
  });
};
