import { type Combo, type Plan, TITLE_KEYS, type TitleKey } from "./types";

const THOUSAND = 1000;

/** 12500 -> "12.5k", 15000 -> "15k", 966 -> "966". */
export function formatXp(value: number): string {
  if (value < THOUSAND) {
    return Math.round(value).toLocaleString("en-US");
  }
  const thousands = Math.round(value / 100) / 10;
  return `${thousands.toLocaleString("en-US", { maximumFractionDigits: 1 })}k`;
}

export function titleLabel(key: TitleKey): string {
  return key.replace("rncp", "RNCP ");
}

export function comboKey(selected: readonly TitleKey[]): string {
  return TITLE_KEYS.filter((key) => selected.includes(key)).join("+");
}

export type Mode = "days" | "projects";

export interface Ranked {
  /** Sorted project ids, unique per plan. */
  key: string;
  plan: Plan;
  /** Projects added / dropped compared with the best plan. */
  added: number[];
  removed: number[];
}

/** Most solutions shown at once: they must fit on one line. */
export const MAX_SOLUTIONS = 12;

const planKey = (plan: Plan) => [...plan.ids].sort((a, b) => a - b).join(",");

/** Every distinct plan found for one combination of titles, best first. */
export function rankPlans(combo: Combo | undefined, mode: Mode): Ranked[] {
  if (!combo) {
    return [];
  }
  const pool = [combo[mode], ...(combo.alts ?? []), combo.days, combo.projects];
  const unique = new Map<string, Plan>();
  for (const plan of pool) {
    const key = planKey(plan);
    if (plan.feasible && !unique.has(key)) {
      unique.set(key, plan);
    }
  }
  const primary = (p: Plan) => (mode === "days" ? p.days : p.n);
  const secondary = (p: Plan) => (mode === "days" ? p.n : p.days);
  const sorted = [...unique]
    .sort(
      ([, a], [, b]) =>
        primary(a) - primary(b) || secondary(a) - secondary(b) || a.xp - b.xp,
    )
    .slice(0, MAX_SOLUTIONS);
  const best = new Set(sorted[0]?.[1].ids ?? []);
  const bestKey = planKey(combo[mode]);
  return sorted.map(([key, plan]) => {
    const ids = new Set(plan.ids);
    return {
      key,
      // Only the optimizer's answer carries a proof; in "projects" mode it
      // extends to any plan with the same, proven minimal, project count.
      plan:
        key === bestKey ||
        (mode === "projects" &&
          combo.projects.proven &&
          plan.n === combo.projects.n)
          ? { ...plan, proven: combo[mode].proven }
          : { ...plan, proven: false },
      added: plan.ids.filter((id) => !best.has(id)),
      removed: [...best].filter((id) => !ids.has(id)),
    };
  });
}

/** Shared by the comparison table and the bottom bar so their columns line up. */
export function comboColumns(count: number): string {
  return `minmax(20rem,1fr) repeat(${count}, minmax(0,4.25rem))`;
}

/** "+rainfall +zappy −gomoku" */
export function diffText(
  added: number[],
  removed: number[],
  names: (id: number) => string,
): string {
  return [
    ...added.map((id) => `+${names(id)}`),
    ...removed.map((id) => `−${names(id)}`),
  ].join(" ");
}
