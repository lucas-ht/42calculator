import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import {
  comboColumns,
  diffText,
  formatXp,
  type Mode,
  type Ranked,
} from "./format";
import { Segmented } from "./segmented";

interface SolutionsBarProps {
  ranked: Ranked[];
  names: (id: number) => string;
  mode: Mode;
  onMode: (mode: Mode) => void;
  selectedKey: string;
  onPick: (key: string) => void;
}

/** Bottom bar: the objective on the left, the plans found for the chosen
 * titles best first on the right (same columns as the comparison table). */
export function SolutionsBar({
  ranked,
  names,
  mode,
  onMode,
  selectedKey,
  onPick,
}: SolutionsBarProps) {
  return (
    <div
      style={{ "--cols": comboColumns(ranked.length) } as CSSProperties}
      className="bg-background bottom-0 z-10 -mx-4 mt-auto flex flex-col gap-2 rounded-b-lg border-t px-4 py-2 md:sticky md:-mx-6 md:grid md:[grid-template-columns:var(--cols)] md:items-center md:gap-0 md:px-6"
    >
      <Segmented
        label="Optimise for"
        value={mode}
        options={[
          ["days", "Fastest"],
          ["projects", "Fewest projects"],
        ]}
        onChange={onMode}
      />
      <ol className="grid grid-cols-5 gap-1 md:contents">
        {ranked.map(({ key, plan, added, removed }, i) => {
          const active = key === selectedKey;
          const days = `${Math.round(plan.days)} d`;
          const projects = `${plan.n} pj`;
          return (
            <li
              key={key}
              className="min-w-0"
            >
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onPick(key)}
                title={`Plan ${i + 1}: ${Math.round(plan.days)} days · ${plan.n} projects · ${formatXp(plan.xp)} XP${i > 0 ? `\nvs plan 1: ${diffText(added, removed, names)}` : ""}`}
                className={cn(
                  "flex w-full min-w-0 cursor-pointer flex-col items-center rounded-md px-1 py-0.5 leading-tight transition-colors md:mx-auto md:w-[calc(100%-0.25rem)]",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent",
                )}
              >
                <span
                  className={cn(
                    "max-w-full truncate text-[10px] tracking-tight",
                    active
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground",
                  )}
                >
                  #{i + 1}
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {mode === "days" ? days : projects}
                </span>
                <span className="text-[10px] tabular-nums opacity-70">
                  {mode === "days" ? projects : days}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
