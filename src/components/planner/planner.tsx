"use client";

import { InfoIcon, TriangleAlertIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { comboKey, formatXp, type Mode, rankPlans } from "./format";
import { Matrix } from "./matrix";
import { Path } from "./path";
import { Segmented } from "./segmented";
import { SolutionsBar } from "./solutions";
import { TitlePicker } from "./title-picker";
import {
  type PlannerData,
  type PlannerInitialState,
  TITLE_KEYS,
  type TitleKey,
} from "./types";

const DAYS_PER_MONTH = 30.4;

type View = PlannerInitialState["view"];

/** Default selection: the fastest single title. */
function fastestSingle(data: PlannerData): TitleKey {
  const combos = data.variants[String(data.full_mask)] ?? {};
  let best: TitleKey = TITLE_KEYS[0];
  for (const key of TITLE_KEYS) {
    const days = combos[key]?.days;
    const bestDays = combos[best]?.days;
    if (days?.feasible && (!bestDays?.feasible || days.days < bestDays.days)) {
      best = key;
    }
  }
  return best;
}

export function Planner({
  data,
  initial,
}: {
  data: PlannerData;
  initial: PlannerInitialState;
}) {
  const [selected, setSelected] = useState<TitleKey[]>(
    () => initial.titles ?? [fastestSingle(data)],
  );
  const [mode, setMode] = useState<Mode>(initial.mode);
  const [view, setView] = useState<View>(initial.view);
  // Plan picked in the bottom bar; reset to the best one when the titles or
  // the objective change.
  const [picked, setPicked] = useState<string | null>(null);

  // Keep the URL shareable without triggering navigations.
  useEffect(() => {
    const params = new URLSearchParams({
      titles: TITLE_KEYS.filter((k) => selected.includes(k)).join(","),
    });
    if (mode === "projects") {
      params.set("mode", mode);
    }
    if (view === "compare") {
      params.set("view", view);
    }
    window.history.replaceState(
      null,
      "",
      `?${params.toString().replaceAll("%2C", ",")}`,
    );
  }, [selected, mode, view]);

  const toggle = (key: TitleKey) => {
    setPicked(null);
    setSelected((current) => {
      if (!current.includes(key)) {
        return [...current, key];
      }
      return current.length > 1 ? current.filter((k) => k !== key) : current;
    });
  };
  const changeMode = (next: Mode) => {
    setPicked(null);
    setMode(next);
  };

  const combos = data.variants[String(data.full_mask)] ?? {};
  const selectedKey = comboKey(selected);
  const combo = combos[selectedKey];
  const ranked = rankPlans(combo, mode);
  const best = ranked[0]?.plan ?? combo?.[mode];
  const current = ranked.find(({ key }) => key === picked) ?? ranked[0];
  const plan = current?.plan ?? best;
  const names = (id: number) => data.projects[String(id)]?.n ?? String(id);

  const delta: Partial<Record<TitleKey, number>> = {};
  if (best?.feasible) {
    for (const key of TITLE_KEYS) {
      const next = rankPlans(combos[comboKey([...selected, key])], mode)[0]
        ?.plan;
      if (!selected.includes(key) && next?.feasible) {
        delta[key] = Math.max(
          0,
          Math.round(mode === "days" ? next.days - best.days : next.n - best.n),
        );
      }
    }
  }

  const level = Math.max(...selected.map((key) => data.titles[key].level));
  const events = Math.max(...selected.map((key) => data.titles[key].events));
  const done = data.baseline.done.map((project) => project.n).join(", ");
  const notes = [
    `Covers level ${level} and every condition; prerequisites needed to unlock a project are counted.`,
    `Not included: ${events} events to attend.`,
    `Rules: gcc.42.fr, Nov. 2026. From level ${data.baseline.level}${done ? ` (${done} done)` : ""}, ~${data.meta.rate} days per 1000 XP.`,
  ].join("\n");

  return (
    <div className="flex min-h-0 grow flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="space-y-1">
          <CardTitle tag="h1">RNCP planner</CardTitle>
          <CardDescription>
            Pick your titles, get the{" "}
            {mode === "days" ? "fastest path" : "fewest projects"}.
          </CardDescription>
        </div>
        <Segmented
          label="View"
          value={view}
          options={[
            ["plan", "Plan"],
            ["compare", "Compare"],
          ]}
          onChange={setView}
        />
        {plan?.feasible && (
          <p
            className="text-muted-foreground ml-auto flex items-baseline gap-x-3"
            title={notes}
          >
            <span>
              <span className="text-foreground text-3xl font-semibold tracking-tight">
                {Math.round(plan.days)}
              </span>{" "}
              days
              {current && current !== ranked[0] ? (
                <span className="ml-1.5 text-xs">
                  plan #{ranked.indexOf(current) + 1}
                </span>
              ) : (
                !plan.proven && (
                  <span
                    className="ml-1.5 text-xs"
                    title="Best plan found within the search budget; a slightly shorter one is not ruled out"
                  >
                    best found
                  </span>
                )
              )}
            </span>
            <span>
              ≈ {Math.round(plan.days / DAYS_PER_MONTH)} months ·{" "}
              <span className="text-foreground">{plan.n} projects</span> ·{" "}
              {formatXp(plan.xp)} XP
            </span>
            <InfoIcon
              aria-label={notes}
              className="size-3.5 shrink-0 self-center"
            />
          </p>
        )}
      </div>

      <TitlePicker
        titles={data.titles}
        selected={selected}
        delta={delta}
        unit={mode === "days" ? "d" : "pj"}
        onToggle={toggle}
      />

      {plan?.feasible ? (
        view === "plan" ? (
          <Path
            ids={plan.ids}
            checks={plan.checks}
            selected={combo.combo}
            data={data}
          />
        ) : (
          <div className="relative min-h-[28rem] grow">
            <div className="md:absolute md:inset-0 md:flex md:flex-col">
              <Matrix
                ranked={ranked}
                selectedKey={current?.key ?? ""}
                onPick={setPicked}
                data={data}
              />
            </div>
          </div>
        )
      ) : (
        <div className="border-destructive/50 flex items-start gap-3 rounded-md border p-4 text-sm">
          <TriangleAlertIcon
            aria-hidden
            className="text-destructive mt-0.5 size-4 shrink-0"
          />
          <p>No path found for this combination.</p>
        </div>
      )}

      <SolutionsBar
        ranked={ranked}
        names={names}
        mode={mode}
        onMode={changeMode}
        selectedKey={current?.key ?? ""}
        onPick={setPicked}
      />
    </div>
  );
}
