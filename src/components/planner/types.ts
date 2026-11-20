export type TitleKey = "rncp6-1" | "rncp6-2" | "rncp7-1" | "rncp7-2";

export const TITLE_KEYS: TitleKey[] = [
  "rncp6-1",
  "rncp6-2",
  "rncp7-1",
  "rncp7-2",
];

export interface Check {
  /** French label coming from the optimizer. */
  l: string;
  /** Needed. */
  n: number;
  /** Had (null = unknown). */
  h: number | null;
  u: "xp" | "n";
  ok: boolean | null;
}

export interface Plan {
  feasible: boolean;
  n: number;
  units: number;
  days: number;
  xp: number;
  proven: boolean;
  n_raw: number;
  ids: number[];
  checks: Check[];
}

export interface Combo {
  combo: TitleKey[];
  kind: "single" | "pair" | "triple" | "quad";
  projects: Plan;
  days: Plan;
  /** Other valid plans found by banning projects of the best ones. */
  alts?: Plan[];
}

export interface Chain {
  id: string;
  label: string;
  confidence: string;
  note: string;
  n: number;
}

export interface Project {
  n: string;
  xp: number;
  d: number;
  t: string[];
  s: string;
  c?: string[];
  sub?: number;
  ch?: [string, number, number];
  /** Projects that must be validated first (intra prerequisites). */
  pre?: number[];
  /** Intra slug, for the project link. */
  sl?: string;
  /** 1 when the project is a piscine. */
  pi?: 1;
}

export interface TitleInfo {
  name: string;
  level: number;
  level_xp: number;
  events: number;
  exp: number;
  suite: number;
  group: number;
  options: { t: string; xp: number; n: number; pool: number; ids: number[] }[];
}

export interface PlannerData {
  baseline: {
    xp: number;
    level: number;
    done: { id: number; n: string; xp: number }[];
  };
  chains: Chain[];
  full_mask: number;
  only_full: boolean;
  variants: Record<string, Record<string, Combo>>;
  projects: Record<string, Project>;
  titles: Record<TitleKey, TitleInfo>;
  /** Pools of the general conditions, by label. */
  pools: Record<string, number[]>;
  meta: {
    rate: number;
    cats: Record<string, string>;
    risky: number[];
  };
}

export interface PlannerInitialState {
  titles: TitleKey[] | null;
  mode: "days" | "projects";
  view: "plan" | "compare";
}
