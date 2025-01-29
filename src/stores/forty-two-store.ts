import type {
  FortyTwoCursus,
  FortyTwoLevel,
  FortyTwoProject,
  FortyTwoTitle,
} from "@/types/forty-two";
import { createStore } from "zustand/vanilla";

export type FortyTwoState = {
  cursus: FortyTwoCursus;
  levels: Record<number, FortyTwoLevel>;
  projects: Record<number, FortyTwoProject>;
  titles: FortyTwoTitle[];
};

export type FortyTwoStore = FortyTwoState;

export type FortyTwoStoreInitProps = {
  cursus?: FortyTwoCursus | undefined;
  levels?: Record<number, FortyTwoLevel> | undefined;
  projects?: Record<number, FortyTwoProject> | undefined;
  titles?: FortyTwoTitle[] | undefined;
};

export const initFortyTwoStore = ({
  cursus,
  levels,
  projects,
  titles,
}: FortyTwoStoreInitProps): FortyTwoState => {
  return {
    cursus: cursus ?? defaultInitState.cursus,
    levels: levels ?? defaultInitState.levels,
    projects: projects ?? defaultInitState.projects,
    titles: titles ?? defaultInitState.titles,
  };
};

export const defaultInitState: FortyTwoState = {
  cursus: {
    id: 0,
    name: "",
    slug: "",
    level: 0,
    events: 0,
    projects: {},
  },
  levels: {},
  projects: {},
  titles: [],
};

export const createFortyTwoStore = (
  initState: FortyTwoState = defaultInitState,
) => {
  return createStore<FortyTwoStore>()(() => ({
    ...initState,
  }));
};
