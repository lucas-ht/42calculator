import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { comboColumns, diffText, formatXp, type Ranked } from "./format";
import type { PlannerData } from "./types";

const GOLD_DOT = "bg-[#b0954c]";

interface MatrixProps {
  ranked: Ranked[];
  selectedKey: string;
  onPick: (key: string) => void;
  data: PlannerData;
}

/** Every project used by at least one plan (rows) against every plan, best
 * first (columns, aligned with the bottom bar). */
export function Matrix({ ranked, selectedKey, onPick, data }: MatrixProps) {
  const plans = ranked.map(({ plan }) => new Set(plan.ids));
  const count = new Map<number, number>();
  for (const ids of plans) {
    for (const id of ids) {
      count.set(id, (count.get(id) ?? 0) + 1);
    }
  }
  const rows = [...count]
    .map(([id, c]) => ({ id, c, project: data.projects[String(id)] }))
    .filter((row) => row.project)
    .sort((a, b) => b.c - a.c || b.project.xp - a.project.xp);
  const maxXp = Math.max(1, ...rows.map((row) => row.project.xp));
  const sel = ranked.findIndex(({ key }) => key === selectedKey);
  const total = ranked.length;

  const style = {
    "--cols": comboColumns(total),
    "--cols-sm": `minmax(0,1fr) repeat(${total}, 1rem)`,
    "--rows": `auto repeat(${rows.length}, minmax(0,1fr))`,
  } as CSSProperties;

  return (
    <div
      aria-label="Projects used by each plan"
      style={style}
      className="grid min-h-0 grow [grid-template-columns:var(--cols-sm)] text-xs md:[grid-template-columns:var(--cols)] md:[grid-template-rows:var(--rows)]"
    >
      <div className="contents">
        <div className="text-muted-foreground flex items-end gap-2 border-b pb-1">
          <span className="min-w-0 grow truncate">
            {total} plans · {rows.length} projects · columns = plans below
          </span>
          <span className="hidden w-10 min-[1400px]:block">Cat.</span>
          <span className="hidden w-10 text-right md:block">XP</span>
          <span className="hidden w-9 text-right md:block">Days</span>
          <span
            className="hidden w-8 text-right md:block"
            title={`In how many of the ${total} plans`}
          >
            /{total}
          </span>
        </div>
        {ranked.map(({ key, plan, added, removed }, i) => (
          <button
            key={key}
            type="button"
            onClick={() => onPick(key)}
            title={`Plan ${i + 1}: ${Math.round(plan.days)} days · ${plan.n} projects${i > 0 ? `\n${diffText(added, removed, (id) => data.projects[String(id)]?.n ?? String(id))}` : ""}`}
            className={cn(
              "cursor-pointer border-b pb-1 text-center tabular-nums",
              i === sel
                ? "bg-primary/10 text-primary rounded-t-md font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {rows.map(({ id, c, project }) => {
        const inPlan = sel >= 0 && plans[sel].has(id);
        const cats = project.c ?? [];
        return (
          <div
            key={id}
            className="contents"
          >
            <div className="border-border/40 flex h-5 min-h-0 items-center gap-2 border-b md:h-auto">
              <span
                className="relative min-w-0 grow truncate"
                title={`${project.n} · ${formatXp(project.xp)} XP · ${project.d} days`}
              >
                <span
                  aria-hidden
                  className="bg-muted absolute inset-y-0 left-0 rounded-sm"
                  style={{ width: `${(project.xp / maxXp) * 100}%` }}
                />
                <span
                  className={cn("relative px-1", inPlan && "font-semibold")}
                >
                  {project.n}
                  {project.sub ? (
                    <span className="text-muted-foreground ml-1 font-normal">
                      +{project.sub} modules
                    </span>
                  ) : null}
                </span>
              </span>
              <span
                className="text-muted-foreground hidden w-10 truncate min-[1400px]:block"
                title={cats.map((cat) => data.meta.cats[cat] ?? cat).join(", ")}
              >
                {cats.join("")}
              </span>
              <span className="hidden w-10 text-right tabular-nums md:block">
                {formatXp(project.xp)}
              </span>
              <span className="text-muted-foreground hidden w-9 text-right tabular-nums md:block">
                {project.d}
              </span>
              <span className="text-muted-foreground hidden w-8 text-right tabular-nums md:block">
                {c}
              </span>
            </div>
            {plans.map((ids, i) => (
              <div
                key={ranked[i].key}
                className={cn(
                  "border-border/40 flex min-h-0 items-center justify-center border-b",
                  i === sel && "bg-primary/10",
                )}
              >
                {ids.has(id) ? (
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      i === sel ? GOLD_DOT : "bg-foreground/70",
                    )}
                  />
                ) : (
                  <span className="bg-muted-foreground/40 size-0.5 rounded-full" />
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
