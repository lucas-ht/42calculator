"use client";

import {
  CheckIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  CircleIcon,
  WavesLadderIcon,
} from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { formatXp } from "./format";
import type { Check, PlannerData, Project, TitleKey } from "./types";

/** Skipped projects shown per card: as many as fit, never fewer than this. */
const SKIPPED_MIN = 1;
const SKIPPED_MAX = 12;
/** General conditions where listing every other project would only be noise. */
const NO_SKIPPED = new Set(["Projet suite", "Projets de groupe"]);

const INTRA = "https://projects.intra.42.fr/projects/";

interface Entry {
  id: number;
  project: Project;
  /** Already validated before the plan. */
  done?: boolean;
}

interface Section {
  name: string;
  need: { xp: number; n: number };
  pool: Set<number>;
  rows: Entry[];
  skipped: Entry[];
  xp: number;
  n: number;
}

/** Short card titles, so the two bars fit next to them. */
const SHORT: Record<string, string> = {
  "Object Oriented Programming": "OOP",
  "Functional programming": "Functional",
  "Imperative programming": "Imperative",
  "System administration": "SysAdmin",
  "Artificial Intelligence": "AI",
  "Web - Database": "Web · DB",
  "Experiences pro": "Internships",
  "Projet suite": "Suite",
  "Projets de groupe": "Group projects",
};

const short = (name: string) => SHORT[name] ?? name;

function entry(id: number, data: PlannerData, done = false): Entry | null {
  const project = data.projects[String(id)];
  return project ? { id, project, done } : null;
}

function isEntry(value: Entry | null): value is Entry {
  return value !== null;
}

/** One section per condition; a project is listed in every condition it
 * counts for. */
function buildSections(
  ids: number[],
  checks: Check[],
  selected: TitleKey[],
  data: PlannerData,
): Section[] {
  const had = new Map(checks.map((check) => [check.l, check.h ?? 0]));
  const done = data.baseline.done.map((project) => project.id);
  const required = new Map<string, Section>();
  const add = (name: string, xp: number, n: number, pool: number[]) => {
    const prev = required.get(name);
    if (prev) {
      prev.need = {
        xp: Math.max(prev.need.xp, xp),
        n: Math.max(prev.need.n, n),
      };
      for (const id of pool) {
        prev.pool.add(id);
      }
      return;
    }
    required.set(name, {
      name,
      need: { xp, n },
      pool: new Set(pool),
      rows: [],
      skipped: [],
      xp: 0,
      n: 0,
    });
  };
  for (const key of selected) {
    for (const option of data.titles[key].options) {
      add(option.t, option.xp, option.n, option.ids);
    }
  }
  const general: [string, number][] = [
    ["Experiences pro", Math.max(...selected.map((k) => data.titles[k].exp))],
    ["Projet suite", Math.max(...selected.map((k) => data.titles[k].suite))],
    [
      "Projets de groupe",
      Math.max(...selected.map((k) => data.titles[k].group)),
    ],
  ];
  for (const [name, n] of general) {
    if (n > 0) {
      add(name, 0, n, data.pools[name] ?? []);
    }
  }

  const listed = [
    ...done.map((id) => entry(id, data, true)),
    ...ids.map((id) => entry(id, data)),
  ].filter(isEntry);
  const taken = new Set([...ids, ...done]);
  const placed = new Set<number>();
  const sections = [...required.values()];
  for (const section of sections) {
    // Totals come from the optimizer (they include already validated projects).
    section.xp = had.get(`${section.name} · XP`) ?? 0;
    section.n =
      had.get(`${section.name} · projets`) ?? had.get(section.name) ?? 0;
    section.rows = listed
      .filter((item) => section.pool.has(item.id))
      .sort((a, b) => b.project.d - a.project.d);
    for (const item of section.rows) {
      placed.add(item.id);
    }
    section.skipped = NO_SKIPPED.has(section.name)
      ? []
      : [...section.pool]
          .filter((id) => !taken.has(id))
          .map((id) => entry(id, data))
          .filter(isEntry)
          .sort((a, b) => b.project.xp - a.project.xp);
  }

  const extra = listed.filter((item) => !placed.has(item.id) && !item.done);
  if (extra.length > 0) {
    sections.push({
      name: "Extra XP",
      need: { xp: 0, n: 0 },
      pool: new Set(extra.map((item) => item.id)),
      rows: extra,
      skipped: [],
      xp: extra.reduce((sum, item) => sum + item.project.xp, 0),
      n: extra.length,
    });
  }
  return sections;
}

const GOLD = "bg-[#b0954c] text-neutral-900";
/** Projects counting for several conditions: brighter, with a slow shine. */
const SUPER =
  "bg-[linear-gradient(110deg,#e9bf3c_35%,#fff1b8_50%,#e9bf3c_65%)] bg-[length:200%_100%] text-neutral-900 shadow-[0_0_10px_-3px_#e9bf3c] motion-safe:animate-super-shine";

function names(ids: number[] | undefined, data: PlannerData): string[] {
  return (ids ?? [])
    .map((id) => data.projects[String(id)]?.n)
    .filter((name): name is string => Boolean(name));
}

/** Prerequisites not validated yet, prerequisites of prerequisites included. */
function missingPrerequisites(
  project: Project,
  taken: Set<number>,
  data: PlannerData,
  seen = new Set<number>(),
): number[] {
  for (const id of project.pre ?? []) {
    if (taken.has(id) || seen.has(id)) {
      continue;
    }
    seen.add(id);
    const pre = data.projects[String(id)];
    if (pre) {
      missingPrerequisites(pre, taken, data, seen);
    }
  }
  return [...seen];
}

function ProjectName({ project }: { project: Project }) {
  if (!project.sl) {
    return <span className="min-w-0 truncate font-medium">{project.n}</span>;
  }
  return (
    <a
      href={`${INTRA}${project.sl}`}
      target="_blank"
      rel="noreferrer"
      className="min-w-0 truncate font-medium underline-offset-2 hover:underline"
    >
      {project.n}
    </a>
  );
}

function Piscine({ project }: { project: Project }) {
  if (!project.pi) {
    return null;
  }
  return (
    <span
      title={`Piscine${project.sub ? ` · ${project.sub} modules` : ""}`}
      className="flex shrink-0 items-center"
    >
      <WavesLadderIcon
        aria-label="Piscine"
        className="size-3.5 opacity-80"
      />
    </span>
  );
}

function Toggle({
  open,
  onClick,
  count,
}: {
  open: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-label={open ? "Hide prerequisites" : "Show prerequisites"}
      title={`${count} prerequisite${count > 1 ? "s" : ""}`}
      className="-my-1 shrink-0 rounded p-0.5 hover:bg-black/10"
    >
      <ChevronRightIcon
        aria-hidden
        className={`size-3.5 transition-transform ${open ? "rotate-90" : ""}`}
      />
    </button>
  );
}

type Status = "plan" | "done" | "missing";

interface Ctx {
  data: PlannerData;
  ids: Set<number>;
  done: Set<number>;
  taken: Set<number>;
  /** Conditions each listed project counts for. */
  hits: Map<number, string[]>;
}

function statusOf(id: number, ctx: Ctx): Status {
  if (ctx.done.has(id)) {
    return "done";
  }
  return ctx.ids.has(id) ? "plan" : "missing";
}

/** The prerequisites of a project, as a nested list that can open further. */
function Prerequisites({ project, ctx }: { project: Project; ctx: Ctx }) {
  return (
    <ul className="mt-1 ml-[1.1rem] space-y-1 border-l pl-2">
      {(project.pre ?? []).map((id) => {
        const pre = ctx.data.projects[String(id)];
        return pre ? (
          <PrerequisiteRow
            key={id}
            project={pre}
            status={statusOf(id, ctx)}
            ctx={ctx}
          />
        ) : null;
      })}
    </ul>
  );
}

const STATUS_TEXT: Record<Status, string> = {
  done: "validated",
  plan: "in the plan",
  missing: "not in the plan",
};

function PrerequisiteRow({
  project,
  status,
  ctx,
}: {
  project: Project;
  status: Status;
  ctx: Ctx;
}) {
  const [open, setOpen] = useState(false);
  const pre = project.pre ?? [];
  const tone =
    status === "missing"
      ? "text-foreground"
      : `${GOLD} ${status === "done" ? "opacity-75" : ""}`;
  return (
    <li>
      <div
        title={`${formatXp(project.xp)} XP · ${project.d} days · ${STATUS_TEXT[status]}`}
        className={`flex items-center gap-2 rounded-md px-2 py-0.5 text-xs ${tone}`}
      >
        {status === "done" ? (
          <CheckIcon
            aria-hidden
            className="size-3.5 shrink-0"
          />
        ) : (
          <CircleIcon
            aria-hidden
            className={`size-3.5 shrink-0 ${status === "missing" ? "text-muted-foreground" : ""}`}
          />
        )}
        <ProjectName project={project} />
        <Piscine project={project} />
        {pre.length > 0 && (
          <Toggle
            open={open}
            count={pre.length}
            onClick={() => setOpen(!open)}
          />
        )}
        <span
          className={`ml-auto shrink-0 tabular-nums ${status === "missing" ? "text-red-400" : ""}`}
        >
          {status === "missing" ? "+1 project" : `${formatXp(project.xp)} xp`}
        </span>
      </div>
      {open && (
        <Prerequisites
          project={project}
          ctx={ctx}
        />
      )}
    </li>
  );
}

function ChosenRow({
  item,
  section,
  ctx,
}: {
  item: Entry;
  section: string;
  ctx: Ctx;
}) {
  const [open, setOpen] = useState(false);
  const { project } = item;
  const chain = project.ch;
  const pre = project.pre ?? [];
  const counts = ctx.hits.get(item.id) ?? [section];
  const isSuper = counts.length > 1;
  const tip = [
    `${formatXp(project.xp)} XP · ${project.d} days`,
    item.done ? "Already validated" : "",
    isSuper ? `Counts for ${counts.map(short).join(", ")}` : "",
    project.pi ? `Piscine${project.sub ? `: ${project.sub} modules` : ""}` : "",
    chain && chain[1] > 1
      ? `Step ${chain[1]}/${chain[2]} of ${chain[0]}: previous steps included`
      : "",
    pre.length > 0 ? `Unlocked by ${names(pre, ctx.data).join(", ")}` : "",
    project.t.includes("0 validation")
      ? "Never validated: may be closed on your campus"
      : "",
  ]
    .filter(Boolean)
    .join("\n");
  return (
    <li>
      <div
        title={tip}
        className={`flex items-center gap-2 rounded-lg px-3 py-1 text-sm ${isSuper ? SUPER : GOLD}`}
      >
        {item.done ? (
          <CheckIcon
            aria-hidden
            className="size-4 shrink-0"
          />
        ) : (
          <CircleIcon
            aria-hidden
            className="size-4 shrink-0"
          />
        )}
        <ProjectName project={project} />
        <Piscine project={project} />
        {project.t.includes("0 validation") && (
          <CircleAlertIcon
            aria-hidden
            className="size-3.5 shrink-0"
          />
        )}
        {pre.length > 0 && (
          <Toggle
            open={open}
            count={pre.length}
            onClick={() => setOpen(!open)}
          />
        )}
        {chain && chain[1] > 1 && (
          <span className="shrink-0 text-xs opacity-70">
            {chain[1]}/{chain[2]}
          </span>
        )}
        {isSuper && (
          <span className="shrink-0 text-xs font-semibold">
            ×{counts.length}
          </span>
        )}
        <span className="ml-auto shrink-0 tabular-nums">
          {formatXp(project.xp)} xp
        </span>
      </div>
      {open && (
        <Prerequisites
          project={project}
          ctx={ctx}
        />
      )}
    </li>
  );
}

interface Part {
  text: string;
  bad: boolean;
}

/** What taking this project instead would cost: every penalty, plus the XP
 * difference with the lightest project of the plan in this card. */
function cost(
  item: Entry,
  section: Section,
  ctx: Ctx,
): { parts: Part[]; tip: string } {
  const missing = missingPrerequisites(item.project, ctx.taken, ctx.data);
  const planned = section.rows.filter((e) => !e.done);
  const ref = (planned.length > 0 ? planned : section.rows).reduce<
    Entry | undefined
  >((low, e) => (low && low.project.xp <= e.project.xp ? low : e), undefined);
  const parts: Part[] = [];
  const tips: string[] = [];
  if (missing.length > 0) {
    parts.push({
      text: `+${missing.length} project${missing.length > 1 ? "s" : ""}`,
      bad: true,
    });
    tips.push(`Needs ${names(missing, ctx.data).join(", ")} first`);
  }
  const preDays = missing.reduce(
    (sum, id) => sum + (ctx.data.projects[String(id)]?.d ?? 0),
    0,
  );
  const days = item.project.d + preDays - (ref?.project.d ?? 0);
  if (ref) {
    const delta = item.project.xp - ref.project.xp;
    if (Math.abs(delta) >= 50) {
      parts.push({
        text: `${delta < 0 ? "−" : "+"}${formatXp(Math.abs(delta))} xp`,
        bad: delta < 0,
      });
    }
    tips.push(
      `${formatXp(item.project.xp)} XP and ${item.project.d} days, vs ${ref.project.n} (${formatXp(ref.project.xp)} XP, ${ref.project.d} days)`,
    );
  } else {
    tips.push(`${formatXp(item.project.xp)} XP · ${item.project.d} days`);
  }
  if (parts.every((part) => !part.bad) && days !== 0) {
    parts.push({
      text: `${days > 0 ? "+" : "−"}${Math.abs(days)} d`,
      bad: days > 0,
    });
  }
  return { parts, tip: tips.join("\n") };
}

function SkippedRow({
  item,
  section,
  ctx,
}: {
  item: Entry;
  section: Section;
  ctx: Ctx;
}) {
  const [open, setOpen] = useState(false);
  const c = cost(item, section, ctx);
  const pre = item.project.pre ?? [];
  return (
    <li>
      <div
        title={`Not in the plan · ${c.tip}`}
        className="flex items-center gap-2 px-3 py-0.5 text-sm"
      >
        <CircleIcon
          aria-hidden
          className="text-muted-foreground size-4 shrink-0"
        />
        <ProjectName project={item.project} />
        <Piscine project={item.project} />
        {pre.length > 0 && (
          <Toggle
            open={open}
            count={pre.length}
            onClick={() => setOpen(!open)}
          />
        )}
        <span className="ml-auto flex shrink-0 gap-1.5 tabular-nums">
          {c.parts.map((part) => (
            <span
              key={part.text}
              className={part.bad ? "text-red-400" : "text-emerald-500"}
            >
              {part.text}
            </span>
          ))}
        </span>
      </div>
      {open && (
        <Prerequisites
          project={item.project}
          ctx={ctx}
        />
      )}
    </li>
  );
}

function SkippedRows({
  section,
  limit,
  ctx,
}: {
  section: Section;
  limit: number;
  ctx: Ctx;
}) {
  const [all, setAll] = useState(false);
  if (section.skipped.length === 0) {
    return null;
  }
  // A "+1 other" line takes as much room as the project itself.
  const fits = section.skipped.length <= limit + 1;
  const shown = all || fits ? section.skipped : section.skipped.slice(0, limit);
  const rest = section.skipped.length - shown.length;
  return (
    <>
      {shown.map((item) => (
        <SkippedRow
          key={item.id}
          item={item}
          section={section}
          ctx={ctx}
        />
      ))}
      {(rest > 0 || (all && !fits)) && (
        <li>
          <button
            type="button"
            onClick={() => setAll(!all)}
            className="text-muted-foreground hover:text-foreground px-3 pl-[2.375rem] text-xs hover:underline"
          >
            {all ? "Show less" : `+${rest} other projects`}
          </button>
        </li>
      )}
    </>
  );
}

function Bar({
  have,
  need,
  unit,
}: {
  have: number;
  need: number;
  unit: "xp" | "pj";
}) {
  const ok = have >= need;
  const pct = need > 0 ? Math.min(100, (have / need) * 100) : 100;
  const value =
    unit === "xp"
      ? `${formatXp(have)} / ${formatXp(need)} XP`
      : `${have} / ${need} projects`;
  return (
    <span
      className="flex min-w-0 flex-1 items-center gap-1.5"
      title={value}
    >
      <span className="bg-muted h-2.5 min-w-6 flex-1 overflow-hidden rounded-full">
        <span
          className={`block h-full rounded-full ${ok ? "bg-[#b0954c]" : "bg-red-400"}`}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="text-muted-foreground shrink-0 text-xs">
        {unit === "pj" ? `${have}/${need}` : formatXp(have)} {unit}
      </span>
    </span>
  );
}

/** Shows as many skipped projects as the screen allows: start high and step
 * down while the page scrolls. Phones scroll anyway, so they get the minimum. */
function useFittingLimit(reset: string): number {
  const [limit, setLimit] = useState(SKIPPED_MAX);
  const [width, setWidth] = useState(0);
  // biome-ignore lint/correctness/useExhaustiveDependencies: refit when the plan changes
  useLayoutEffect(() => {
    setLimit(SKIPPED_MAX);
  }, [reset]);
  useLayoutEffect(() => {
    const onResize = () => {
      setWidth(window.innerWidth);
      setLimit(SKIPPED_MAX);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  // Not on every render: opening a list must not shrink the other cards.
  // biome-ignore lint/correctness/useExhaustiveDependencies: refit when the plan changes
  useLayoutEffect(() => {
    if (width === 0 || limit <= SKIPPED_MIN) {
      return;
    }
    const scrolls =
      document.documentElement.scrollHeight > window.innerHeight + 1;
    if (width < 768 || scrolls) {
      setLimit((value) => Math.max(SKIPPED_MIN, value - 1));
    }
  }, [limit, width, reset]);
  return limit;
}

export function Path({
  ids,
  selected,
  data,
  checks,
}: {
  ids: number[];
  selected: TitleKey[];
  data: PlannerData;
  checks: Check[];
}) {
  const limit = useFittingLimit(`${selected.join("+")}:${ids.join(",")}`);
  const all = buildSections(ids, checks, selected, data);
  const hits = new Map<number, string[]>();
  for (const section of all) {
    for (const item of section.rows) {
      hits.set(item.id, [...(hits.get(item.id) ?? []), section.name]);
    }
  }
  const done = new Set(data.baseline.done.map((project) => project.id));
  const ctx: Ctx = {
    data,
    ids: new Set(ids),
    done,
    taken: new Set([...ids, ...done]),
    hits,
  };
  // Conditions met only through projects already shown in another card:
  // one line each, the projects as chips.
  const compact = all.filter(
    (section) =>
      section.skipped.length === 0 &&
      section.rows.length > 0 &&
      section.rows.every((item) => (hits.get(item.id) ?? []).length > 1),
  );
  const sections = all.filter((section) => !compact.includes(section));

  return (
    <div className="gap-3 sm:columns-2 lg:columns-3 xl:columns-4">
      {sections.map((section) => (
        <section
          key={section.name}
          className="mb-3 break-inside-avoid rounded-2xl border px-3 py-2.5"
        >
          <h2 className="mb-2 flex items-center gap-3 px-1">
            <span
              className="max-w-[45%] shrink-0 truncate text-base font-semibold"
              title={section.name}
            >
              {short(section.name)}
            </span>
            {section.name !== "Extra XP" && (
              <>
                {section.need.xp > 0 && (
                  <Bar
                    have={section.xp}
                    need={section.need.xp}
                    unit="xp"
                  />
                )}
                <Bar
                  have={section.n}
                  need={section.need.n}
                  unit="pj"
                />
              </>
            )}
          </h2>
          <ul className="space-y-1">
            {section.rows.map((item) => (
              <ChosenRow
                key={item.id}
                item={item}
                section={section.name}
                ctx={ctx}
              />
            ))}
            <SkippedRows
              section={section}
              limit={limit}
              ctx={ctx}
            />
          </ul>
        </section>
      ))}
      {compact.length > 0 && (
        <section className="mb-3 break-inside-avoid space-y-2.5 rounded-2xl border px-4 py-3">
          {compact.map((section) => (
            <div key={section.name}>
              <p className="flex items-center gap-3">
                <span className="shrink-0 text-sm font-semibold">
                  {short(section.name)}
                </span>
                <Bar
                  have={section.n}
                  need={section.need.n}
                  unit="pj"
                />
              </p>
              <p className="mt-1.5 flex flex-wrap gap-1">
                {section.rows.map((item) => (
                  <span
                    key={item.id}
                    title={`Counts for ${(hits.get(item.id) ?? []).map(short).join(", ")}`}
                    className={`flex max-w-full items-center gap-1 rounded-md px-2 py-0.5 text-xs ${SUPER}`}
                  >
                    {item.done && (
                      <CheckIcon
                        aria-hidden
                        className="size-3 shrink-0"
                      />
                    )}
                    <ProjectName project={item.project} />
                    <Piscine project={item.project} />
                  </span>
                ))}
              </p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
