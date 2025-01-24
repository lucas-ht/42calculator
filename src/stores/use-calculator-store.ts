"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  calculateExperience,
  getExperience,
  getLevel,
} from "@/lib/forty-two/forty-two-calculator";
import { fortyTwoStore } from "@/providers/forty-two-store-provider";
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
};

export type CalculatorActions = {
  getProjects: () => CalculatorEntry[];
  setLevel: (level: number) => void;
  addProject: (project: FortyTwoProject) => void;
  updateProject: (entry: CalculatorEntry) => void;
  removeProject: (projectId: number) => void;
  // recalculateLevels needs to be exposed for the rehydration process
  recalculateLevels: () => void;
};

export type CalculatorStore = CalculatorState & CalculatorActions;

export const useCalculatorStore = create<CalculatorStore>()(
  persist(
    (set, get) => {
      const {
        cursus: { level: initialLevel },
        levels,
      } = fortyTwoStore.getState();

      const initialExperience = getExperience(initialLevel, levels);

      // Helper to recalculate experience & levels
      const recalculateLevels = () => {
        const state = get();
        const { levels } = fortyTwoStore.getState();

        let experience = state.experience.start;
        const entries = Object.values(state.entries).sort(
          (a, b) => a.addedAt - b.addedAt,
        );

        const updatedNodes = entries.map((entry) => {
          experience += entry.experience;
          const newLevel = getLevel(experience, levels);

          return {
            [entry.project.id]: {
              ...entry,
              level: newLevel,
            },
          };
        });

        set(() => ({
          entries: {
            ...state.entries,
            ...Object.assign({}, ...updatedNodes),
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
      };

      return {
        level: { start: initialLevel, end: initialLevel },
        experience: {
          start: initialExperience,
          end: initialExperience,
        },
        entries: {},

        recalculateLevels,

        getProjects: () => {
          const state = get();
          return Object.values(state.entries).sort(
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

        addProject: (project: FortyTwoProject) => {
          const state = get();
          const { levels } = fortyTwoStore.getState();

          if (state.entries[project.id]) {
            return;
          }

          const experience = calculateExperience(
            project.experience ?? 0,
            100,
            false,
          );
          const level = getLevel(state.experience.end + experience, levels);

          const node: CalculatorEntry = {
            project: {
              ...project,
              mark: 100,
              bonus: false,
            },
            addedAt: Date.now(),
            experience: experience,
            level: level,
          };

          set(() => ({
            level: {
              ...state.level,
              end: level,
            },
            experience: {
              ...state.experience,
              end: state.experience.end + experience,
            },
            entries: {
              ...state.entries,
              [node.project.id]: node,
            },
          }));
        },

        updateProject: (entry: CalculatorEntry) => {
          const state = get();
          if (!state.entries[entry.project.id]) {
            return;
          }

          const experience = calculateExperience(
            entry.project.experience ?? 0,
            entry.project.mark ?? 0,
            entry.project.bonus ?? false,
          );

          set(() => ({
            entries: {
              ...state.entries,
              [entry.project.id]: {
                ...entry,
                experience: experience,
              },
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
      };
    },
    {
      name: "calculator-storage",
      skipHydration: true,
      partialize: (state: CalculatorStore) => ({
        entries: state.entries,
      }),
      onRehydrateStorage:
        () => (state: CalculatorStore | undefined, error: unknown) => {
          if (error || !state) {
            return;
          }
          // A short setTimeout ensures the store is fully hydrated.
          setTimeout(() => {
            state.recalculateLevels();
          }, 0);
        },
    },
  ),
);

export function useCalculatorStoreHydrator() {
  useEffect(() => {
    useCalculatorStore.persist.rehydrate();
  }, []);
}
