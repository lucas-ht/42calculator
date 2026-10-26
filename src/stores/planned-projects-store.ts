import { create } from "zustand";
import { persist } from "zustand/middleware";

/** A project the user plans / simulates completing, with its calculator config. */
export interface PlannedProject {
  mark: number;
  bonus: boolean;
}

export interface PlannedProjectsStore {
  /** Shared list of planned projects, keyed by project id. */
  planned: Record<number, PlannedProject>;

  isPlanned: (projectId: number) => boolean;
  toggle: (projectId: number) => void;
  setConfig: (projectId: number, config: Partial<PlannedProject>) => void;
  remove: (projectId: number) => void;
  clear: () => void;
  /**
   * Drop planned projects the student has actually completed (validated in the
   * 42 API), so an "expected" project that became real stops being simulated.
   */
  reconcile: (validatedProjectIds: number[]) => void;
}

const DEFAULT_CONFIG: PlannedProject = { mark: 100, bonus: false };

/**
 * A single, localStorage-persisted store shared by the RNCP tool and the
 * Calculator. Both read/write the same list, so a project simulated in RNCP
 * shows up in the Calculator (and vice-versa) and survives reloads.
 *
 * `skipHydration` keeps SSR safe: the first client render matches the server
 * (empty), then `rehydrate()` (see use-planned-projects-hydration) applies the
 * stored value.
 */
export const usePlannedProjects = create<PlannedProjectsStore>()(
  persist(
    (set, get) => ({
      planned: {},

      isPlanned: (projectId) => Boolean(get().planned[projectId]),

      toggle: (projectId) =>
        set((state) => {
          const next = { ...state.planned };
          if (next[projectId]) {
            delete next[projectId];
          } else {
            next[projectId] = { ...DEFAULT_CONFIG };
          }
          return { planned: next };
        }),

      setConfig: (projectId, config) =>
        set((state) => ({
          planned: {
            ...state.planned,
            [projectId]: {
              ...(state.planned[projectId] ?? DEFAULT_CONFIG),
              ...config,
            },
          },
        })),

      remove: (projectId) =>
        set((state) => {
          if (!state.planned[projectId]) {
            return state;
          }
          const next = { ...state.planned };
          delete next[projectId];
          return { planned: next };
        }),

      clear: () => set({ planned: {} }),

      reconcile: (validatedProjectIds) =>
        set((state) => {
          const next = { ...state.planned };
          let changed = false;
          for (const id of validatedProjectIds) {
            if (next[id]) {
              delete next[id];
              changed = true;
            }
          }
          return changed ? { planned: next } : state;
        }),
    }),
    { name: "42calc:planned-projects", skipHydration: true },
  ),
);
