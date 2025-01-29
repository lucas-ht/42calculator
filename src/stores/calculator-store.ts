"use client";

import { create } from "zustand";

import {
  calculateExperience,
  getExperience,
  getLevel,
} from "@/lib/forty-two/forty-two-calculator";
import { useFortyTwoStore } from "@/providers/forty-two-store-provider";
import type { FortyTwoProject, CalculatorEntry } from "@/types/forty-two";

export type CalculatorState = {
  level: {
    start: number;
    end: number;
  };
  experience: {
    start: number;
    end: number;
  };
  entries: Record<number, CalculatorEntry>;
  nextOrder: number;
};

export type CalculatorActions = {
  getProjects: () => CalculatorEntry[];
  setLevel: (level: number) => void;
  addProject: (project: FortyTwoProject) => void;
  updateProject: (entry: CalculatorEntry) => void;
  removeProject: (projectId: number) => void;
  resetProjects: () => void;
  // recalculateLevels needs to be exposed for the rehydration process
  recalculateLevels: () => void;
};

export type CalculatorStore = CalculatorState & CalculatorActions;

export const initCalculatorStore = (): CalculatorState => {
  const {
    cursus: { level },
    levels,
  } = useFortyTwoStore((state) => state);
  const experience = getExperience(level, levels);

  return {
    level: {
      start: level,
      end: level,
    },
    experience: {
      start: experience,
      end: experience,
    },
    entries: {},
    nextOrder: 0,
  };
};

export const createCalculatorStore = (initState: CalculatorState) => {
  return create<CalculatorStore>()((set, get) => {
    const { levels } = useFortyTwoStore((state) => state);

    // Helper to recalculate experience & levels
    function recalculateLevels() {
      const state = get();
      let experience = state.experience.start;

      function recalculateEntry(entry: CalculatorEntry): CalculatorEntry {
        entry.children = entry.children
          .sort((a, b) => a.order - b.order)
          .map((child) => recalculateEntry(child));

        experience += entry.experience;
        entry.level = getLevel(experience, levels);

        return entry;
      }

      const sortedEntries = Object.values(state.entries).sort(
        (a, b) => a.order - b.order,
      );

      const updatedEntries: Record<number, CalculatorEntry> = {};
      for (let entry of sortedEntries) {
        entry = recalculateEntry(entry);
        updatedEntries[entry.project.id] = entry;
      }

      set(() => ({
        entries: {
          ...state.entries,
          ...updatedEntries,
        },
        experience: {
          ...state.experience,
          end: experience,
        },
        level: {
          ...state.level,
          end: getLevel(experience, levels),
        },
      }));
    }

    return {
      ...initState,

      recalculateLevels,

      getProjects: () => {
        const state = get();
        return Object.values(state.entries).sort((a, b) => a.order - b.order);
      },

      setLevel: (level: number) => {
        const state = get();
        const { levels } = useFortyTwoStore((state) => state);

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

      addProject: (project: FortyTwoProject) => {
        function getCalculatorEntry(project: FortyTwoProject): CalculatorEntry {
          const state = get();
          const entry: CalculatorEntry = {
            project: {
              ...project,
              mark: 100,
              bonus: false,
            },
            order: state.nextOrder,

            experience: project.experience,
            level: 0,

            children: [],
          };

          set(() => ({
            nextOrder: state.nextOrder + 1,
          }));

          return entry;
        }

        const children: CalculatorEntry[] = [];
        for (const child of project.children) {
          const childEntry = getCalculatorEntry(child);
          childEntry.parentId = project.id;
          children.push(childEntry);
        }

        const entry = getCalculatorEntry(project);
        entry.children = children;

        set((state) => ({
          entries: {
            ...state.entries,
            [project.id]: entry,
          },
        }));

        recalculateLevels();
      },

      updateProject: (entry: CalculatorEntry) => {
        const state = get();

        entry.experience = calculateExperience(
          entry.project.experience,
          entry.project.mark ?? 0,
          entry.project.bonus ?? false,
        );

        for (const child of entry.children) {
          child.project.mark = entry.project.mark;
          child.project.bonus = entry.project.bonus;

          child.experience = calculateExperience(
            child.project.experience,
            child.project.mark ?? 0,
            child.project.bonus ?? false,
          );
        }

        if (entry.parentId && state.entries[entry.parentId]) {
          const parent = state.entries[entry.parentId];
          parent.children = parent.children.map((child) =>
            child.project.id === entry.project.id ? entry : child,
          );

          set(() => ({
            entries: {
              ...state.entries,
              [parent.project.id]: parent,
            },
          }));

          return recalculateLevels();
        }

        if (!state.entries[entry.project.id]) {
          return;
        }

        set(() => ({
          entries: {
            ...state.entries,
            [entry.project.id]: entry,
          },
        }));

        recalculateLevels();
      },

      removeProject: (projectId: number) => {
        const state = get();
        if (!state.entries[projectId]) {
          return;
        }

        delete state.entries[projectId];
        set(() => ({
          entries: {
            ...state.entries,
          },
        }));

        recalculateLevels();
      },

      resetProjects: () => {
        set(() => ({
          entries: {},
          nextOrder: 0,
        }));

        recalculateLevels();
      },
    };
  });
};
