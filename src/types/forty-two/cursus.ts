import type { FortyTwoProject } from "./project";

export enum FortyTwoCursusId {
  MAIN = 21,
}

export interface FortyTwoCursus {
  id: number;
  name: string;
  slug: string;

  level: number;

  events: number;
  projects: Record<number, FortyTwoProject>;
}
