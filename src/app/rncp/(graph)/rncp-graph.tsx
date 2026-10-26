"use client";

import { Minus, Plus, Scan } from "lucide-react";
import { JetBrains_Mono } from "next/font/google";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getOptionProgress,
  getProjectProgress,
} from "@/lib/rncp/project-progress";
import { cn } from "@/lib/utils";
import { useFortyTwoStore } from "@/providers/forty-two-store-provider";
import {
  type PlannedProject,
  usePlannedProjects,
} from "@/stores/planned-projects-store";
import type {
  FortyTwoCursus,
  FortyTwoProject,
  FortyTwoTitle,
  FortyTwoTitleOption,
} from "@/types/forty-two";
import { PolarPath } from "./polar-path";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const SIZE = 1000;
const CENTER = SIZE / 2;
const DONUT_INNER = 80;
const DONUT_OUTER = 138;
const TIER_BASE = 184; // radius of XP tier 0
const TIER_GAP = 50; // radius added per XP tier (depth = XP)
const NODE_R = 8;
const CHILD_R = 4;
const PAN_LIMIT = 600;
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 5;

const SEGMENT_COLORS = [
  "#f5c542",
  "#ff5aa1",
  "#a78bfa",
  "#fb7185",
  "#34d399",
  "#f97316",
];

const TYPE_ORDER = ["project", "piscine", "exam"] as const;
type ProjectType = (typeof TYPE_ORDER)[number];
// Piscine projects report 0 XP even though their exercises do grant XP. When
// "fix piscines" is on we pretend they are worth this much (graph only).
const PISCINE_XP = 11000;

function projectType(project: FortyTwoProject): ProjectType {
  const s = project.name.toLowerCase();
  if (s.includes("piscine")) return "piscine";
  if (s.includes("exam")) return "exam";
  return "project";
}

/** Short, arc-friendly certificate name. */
function shortTitle(title: FortyTwoTitle): string {
  const s = title.title.toLowerCase();
  if (s.includes("web")) return "Web & Mobile";
  if (s.includes("applicatif")) return "Applications";
  if (s.includes("information") || s.includes("réseau") || s.includes("reseau"))
    return "System & resources";
  if (
    s.includes("architecture") ||
    s.includes("donné") ||
    s.includes("donnee") ||
    s.includes("data")
  )
    return "Bases de données";
  return title.title;
}

/** XP tiers → radial depth. Higher XP sits further out. Shared across certs. */
function xpTier(xp: number): number {
  if (xp <= 0) return 0;
  if (xp <= 5000) return 1;
  if (xp <= 10000) return 2;
  if (xp <= 15000) return 3;
  if (xp <= 21000) return 4;
  return 5;
}
const tierRadius = (tier: number) => TIER_BASE + tier * TIER_GAP;

interface GraphNode {
  key: string;
  reqKey: string;
  titleIndex: number;
  projectId: number;
  name: string;
  type: ProjectType;
  x: number;
  y: number;
  angle: number;
  shared: boolean;
}

/** An edge between two adjacent projects in a requirement's chain. Each end is
 *  painted independently (half from A, half from B) so it only shows the parts
 *  earned by completed projects. */
interface Edge {
  key: string;
  titleIndex: number;
  aId: number;
  bId: number;
  edgeAB: string; // path A -> B (draw first half = A's side)
  edgeBA: string; // path B -> A (draw first half = B's side)
}

interface ChildNode {
  key: string;
  titleIndex: number;
  x: number;
  y: number;
  px: number;
  py: number;
}

interface Requirement {
  key: string;
  titleIndex: number;
  optionIndex: number;
  name: string;
  a0: number;
  a1: number;
  innerR: number;
  outerR: number;
}

interface Segment {
  title: FortyTwoTitle;
  color: string;
  a0: number;
  a1: number;
  mid: number;
}

/** angle 0 = top, increasing clockwise. */
function polar(radius: number, angle: number) {
  return {
    x: CENTER + radius * Math.sin(angle),
    y: CENTER - radius * Math.cos(angle),
  };
}

function annularSector(r0: number, r1: number, a0: number, a1: number): string {
  const p0o = polar(r1, a0);
  const p1o = polar(r1, a1);
  const p1i = polar(r0, a1);
  const p0i = polar(r0, a0);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${p0o.x} ${p0o.y} A ${r1} ${r1} 0 ${large} 1 ${p1o.x} ${p1o.y} L ${p1i.x} ${p1i.y} A ${r0} ${r0} 0 ${large} 0 ${p0i.x} ${p0i.y} Z`;
}

function arcPath(radius: number, a0: number, a1: number): string {
  const p0 = polar(radius, a0);
  const p1 = polar(radius, a1);
  const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
  const sweep = a1 >= a0 ? 1 : 0;
  return `M ${p0.x} ${p0.y} A ${radius} ${radius} 0 ${large} ${sweep} ${p1.x} ${p1.y}`;
}

interface OptionProgress {
  projects: number;
  simulatedProjects: number;
  experience: number;
  simulatedExperience: number;
  isComplete: boolean;
}

function optionProgress(
  option: FortyTwoTitleOption,
  cursus: FortyTwoCursus,
  planned: Record<number, PlannedProject>,
): OptionProgress {
  return getOptionProgress(option, cursus, planned);
}

function isOptionComplete(
  option: FortyTwoTitleOption,
  cursus: FortyTwoCursus,
  planned: Record<number, PlannedProject>,
): boolean {
  return optionProgress(option, cursus, planned).isComplete;
}

export function RncpGraph({ titles }: { titles: FortyTwoTitle[] }) {
  const { cursus, projects } = useFortyTwoStore((state) => state);
  const planned = usePlannedProjects((state) => state.planned);
  const toggle = usePlannedProjects((state) => state.toggle);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [spread, setSpread] = useState(1);
  const [fixPiscines, setFixPiscines] = useState(true);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<number | null>(null);
  const [titleMode, setTitleMode] = useState<"focus" | "info">("focus");
  const svgRef = useRef<SVGSVGElement>(null);
  const panRef = useRef(pan);
  const zoomRef = useRef(zoom);
  panRef.current = pan;
  zoomRef.current = zoom;
  const drag = useRef<{
    px: number;
    py: number;
    ox: number;
    oy: number;
    moved: boolean;
  } | null>(null);

  // Spread scales content radii outward from the donut edge (separates nodes)
  // without resizing the donut itself.
  const rScale = (r: number) => DONUT_OUTER + (r - DONUT_OUTER) * spread;

  const clampPan = (p: { x: number; y: number }, z: number) => {
    const limit = PAN_LIMIT + (SIZE * (z - 1)) / 2;
    return {
      x: Math.max(-limit, Math.min(limit, p.x)),
      y: Math.max(-limit, Math.min(limit, p.y)),
    };
  };

  const zoomAt = (svgX: number, svgY: number, factor: number) => {
    const z0 = zoomRef.current;
    const z1 = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z0 * factor));
    if (z1 === z0) return;
    const p0 = panRef.current;
    setPan(
      clampPan(
        {
          x: svgX - (svgX - p0.x) * (z1 / z0),
          y: svgY - (svgY - p0.y) * (z1 / z0),
        },
        z1,
      ),
    );
    setZoom(z1);
  };

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const toSvg = SIZE / rect.width;
      zoomAt(
        (e.clientX - rect.left) * toSvg,
        (e.clientY - rect.top) * toSvg,
        e.deltaY < 0 ? 1.12 : 1 / 1.12,
      );
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Deterministic layout: requirement boxes; inside, projects grouped by type
  // (angular lanes) and placed by XP tier (radial depth).
  const { nodes, children, requirements, edges, segments } = useMemo(() => {
    const count = titles.length || 1;
    const sweep = (Math.PI * 2) / count;
    const titlePad = Math.min(0.08, sweep * 0.1);
    const sectionGap = 0.03;
    const rs = (r: number) => DONUT_OUTER + (r - DONUT_OUTER) * spread;

    const titlesPerProject = new Map<number, Set<number>>();
    titles.forEach((title, ti) => {
      for (const option of title.options) {
        for (const id of Object.keys(option.projects).map(Number)) {
          if (!titlesPerProject.has(id)) titlesPerProject.set(id, new Set());
          titlesPerProject.get(id)?.add(ti);
        }
      }
    });

    const segments: Segment[] = titles.map((title, i) => ({
      title,
      color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
      a0: i * sweep,
      a1: (i + 1) * sweep,
      mid: i * sweep + sweep / 2,
    }));

    const nodes: GraphNode[] = [];
    const children: ChildNode[] = [];
    const requirements: Requirement[] = [];
    const edges: Edge[] = [];

    titles.forEach((title, titleIndex) => {
      const t0 = titleIndex * sweep + titlePad;
      const t1 = (titleIndex + 1) * sweep - titlePad;
      const options = title.options;
      const weights = options.map((o) =>
        Math.max(1, Object.keys(o.projects).length),
      );
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      const available = t1 - t0 - sectionGap * Math.max(0, options.length - 1);

      let cursor = t0;
      options.forEach((option, optionIndex) => {
        const share = weights[optionIndex] / totalWeight;
        const s0 = cursor;
        const s1 = cursor + available * share;
        cursor = s1 + sectionGap;

        const reqKey = `${titleIndex}:${optionIndex}`;
        const projects = Object.values(option.projects);

        // group by project type → angular lanes within the requirement
        const byType = new Map<ProjectType, FortyTwoProject[]>();
        for (const p of projects) {
          const type = projectType(p);
          if (!byType.has(type)) byType.set(type, []);
          byType.get(type)?.push(p);
        }
        const types = TYPE_ORDER.filter((t) => byType.has(t));

        const lanePad = Math.min(0.012, (s1 - s0) * 0.06);
        const laneGap = 0.012;
        const laneAvail =
          s1 - s0 - 2 * lanePad - laneGap * Math.max(0, types.length - 1);
        const totalCount = Math.max(1, projects.length);

        let laneCursor = s0 + lanePad;
        let outerR = rs(TIER_BASE);

        types.forEach((type) => {
          const laneProjects = (byType.get(type) ?? [])
            .slice()
            .sort((a, b) => (b.experience || 0) - (a.experience || 0));
          const la0 = laneCursor;
          const la1 =
            laneCursor + laneAvail * (laneProjects.length / totalCount);
          laneCursor = la1 + laneGap;

          // group lane projects by XP tier (same tier → same radius)
          const byTier = new Map<number, FortyTwoProject[]>();
          for (const p of laneProjects) {
            const xp =
              fixPiscines && type === "piscine"
                ? PISCINE_XP
                : p.experience || 0;
            const tier = xpTier(xp);
            if (!byTier.has(tier)) byTier.set(tier, []);
            byTier.get(tier)?.push(p);
          }

          const laneNodes: {
            projectId: number;
            tier: number;
            angle: number;
            radius: number;
          }[] = [];

          for (const [tier, tierProjects] of byTier) {
            const radius = rs(tierRadius(tier));
            outerR = Math.max(outerR, radius);
            const innerPad = Math.min(0.008, (la1 - la0) * 0.12);
            const lone = tierProjects.length <= 1;
            tierProjects.forEach((project, i) => {
              const angle = lone
                ? (la0 + la1) / 2
                : la0 +
                  innerPad +
                  ((la1 - la0 - 2 * innerPad) * i) / (tierProjects.length - 1);
              const { x, y } = polar(radius, angle);

              laneNodes.push({ projectId: project.id, tier, angle, radius });

              nodes.push({
                key: `${reqKey}:${project.id}:${i}:${tier}`,
                reqKey,
                titleIndex,
                projectId: project.id,
                name: project.name,
                type,
                x,
                y,
                angle,
                shared: (titlesPerProject.get(project.id)?.size ?? 0) > 1,
              });

              const kids = project.children ?? [];
              if (kids.length > 0) {
                const kidSpread = Math.min(0.06, (la1 - la0) * 0.6);
                kids.forEach((child, ci) => {
                  const ca =
                    angle -
                    kidSpread / 2 +
                    (kidSpread * (ci + 0.5)) / kids.length;
                  const cp = polar(radius + TIER_GAP * 0.5 * spread, ca);
                  children.push({
                    key: `${reqKey}:${project.id}:${child.id}:${ci}`,
                    titleIndex,
                    x: cp.x,
                    y: cp.y,
                    px: x,
                    py: y,
                  });
                });
              }
            });
          }

          // Chain the lane's nodes (serpentine order) into edges between
          // adjacent projects. Each project paints only half of its edges.
          const tiersSorted = [...new Set(laneNodes.map((n) => n.tier))].sort(
            (a, b) => a - b,
          );
          const ordered: typeof laneNodes = [];
          tiersSorted.forEach((tier, idx) => {
            const tn = laneNodes
              .filter((n) => n.tier === tier)
              .sort((a, b) => a.angle - b.angle);
            if (idx % 2 === 1) tn.reverse();
            ordered.push(...tn);
          });
          for (let i = 0; i < ordered.length - 1; i++) {
            const A = ordered[i];
            const B = ordered[i + 1];
            const pAB = new PolarPath(CENTER, CENTER).moveTo(A.radius, A.angle);
            const pBA = new PolarPath(CENTER, CENTER).moveTo(B.radius, B.angle);
            if (A.radius === B.radius) {
              pAB.arcTo(B.angle);
              pBA.arcTo(A.angle);
            } else {
              pAB.radialTo(B.radius).arcTo(B.angle);
              pBA.arcTo(A.angle).radialTo(A.radius);
            }
            edges.push({
              key: `${reqKey}:${type}:${i}`,
              titleIndex,
              aId: A.projectId,
              bId: B.projectId,
              edgeAB: pAB.toString(),
              edgeBA: pBA.toString(),
            });
          }
        });

        requirements.push({
          key: reqKey,
          titleIndex,
          optionIndex,
          name: option.title,
          a0: s0,
          a1: s1,
          innerR: DONUT_OUTER + 6,
          outerR: outerR + 24,
        });
      });
    });

    return { nodes, children, requirements, edges, segments };
  }, [titles, spread, fixPiscines]);

  const completeByReq = useMemo(() => {
    const map: Record<string, boolean> = {};
    titles.forEach((title, ti) => {
      title.options.forEach((option, oi) => {
        // Completion uses REAL XP — the piscine fix only affects graph
        // placement, not accurate progress.
        map[`${ti}:${oi}`] = isOptionComplete(option, cursus, planned);
      });
    });
    return map;
  }, [titles, cursus, planned]);

  const selectedNodes = selectedProject
    ? nodes.filter((n) => n.projectId === selectedProject)
    : [];
  const selectedName = selectedNodes[0]?.name;
  const infoMode = selectedTitle !== null && titleMode === "info";

  const isActive = (titleIndex: number, projectId: number) =>
    (selectedProject === null && selectedTitle === null) ||
    projectId === selectedProject ||
    titleIndex === selectedTitle;

  function selectTitle(index: number) {
    setSelectedProject(null);
    if (selectedTitle !== index) {
      setSelectedTitle(index);
      setTitleMode("focus");
    } else if (titleMode === "focus") {
      setTitleMode("info");
    } else {
      setSelectedTitle(null);
      setTitleMode("focus");
    }
  }
  function selectProject(id: number) {
    setSelectedTitle(null);
    setSelectedProject(id);
    if (
      projects[id] &&
      getProjectProgress(projects[id], cursus, {}).projects === 0
    )
      toggle(id);
  }
  function clearSelection() {
    setSelectedProject(null);
    setSelectedTitle(null);
  }
  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = {
      px: e.clientX,
      py: e.clientY,
      ox: pan.x,
      oy: pan.y,
      moved: false,
    };
  }
  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.px;
    const dy = e.clientY - drag.current.py;
    if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
    const scale = SIZE / (e.currentTarget.clientWidth || SIZE);
    setPan(
      clampPan(
        { x: drag.current.ox + dx * scale, y: drag.current.oy + dy * scale },
        zoom,
      ),
    );
  }
  function onPointerUp() {
    if (drag.current && !drag.current.moved) clearSelection();
    drag.current = null;
  }

  return (
    <div
      className={cn(
        mono.className,
        "relative w-full overflow-hidden rounded-lg border bg-card/20",
      )}
    >
      {/* biome-ignore lint/a11y/useSemanticElements: SVG controls use keyboard-accessible ARIA roles; HTML fieldsets and buttons cannot replace SVG graphics. */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className={cn(
          mono.className,
          "h-[74vh] max-h-[880px] w-full cursor-grab touch-none select-none active:cursor-grabbing",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        role="group"
        aria-label="RNCP certificates graph"
      >
        <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
          {/* Requirement outlines. The % arc (completion estimate) is always
              shown; the full section box only appears when the cert is focused
              (gray if incomplete, glowing when complete). */}
          {requirements.map((req) => {
            const option = titles[req.titleIndex]?.options[req.optionIndex];
            if (!option) return null;
            const complete = completeByReq[req.key];
            const color =
              SEGMENT_COLORS[req.titleIndex % SEGMENT_COLORS.length];
            const prog = optionProgress(option, cursus, planned);
            const projFrac = Math.min(
              1,
              (prog.projects + prog.simulatedProjects) /
                (option.numberOfProjects || 1),
            );
            const xpFrac =
              option.experience > 0
                ? Math.min(
                    1,
                    (prog.experience + prog.simulatedExperience) /
                      option.experience,
                  )
                : 1;
            const frac = Math.min(projFrac, xpFrac);
            const inFocus =
              selectedTitle === req.titleIndex && titleMode === "focus";
            const dim =
              (selectedTitle !== null && req.titleIndex !== selectedTitle) ||
              selectedProject !== null;
            const mid = (req.a0 + req.a1) / 2;
            const halfSpan = ((req.a1 - req.a0) * Math.max(frac, 0)) / 2;

            return (
              <g key={`req-${req.key}`}>
                {inFocus && (
                  <path
                    id={`req-outline-${req.key}`}
                    d={annularSector(req.innerR, req.outerR, req.a0, req.a1)}
                    fill={complete ? color : "none"}
                    fillOpacity={complete ? 0.03 : 0}
                    stroke={complete ? color : "currentColor"}
                    className={complete ? "" : "text-muted-foreground/40"}
                    strokeWidth={complete ? 2 : 1.25}
                    style={
                      complete
                        ? { filter: `drop-shadow(0 0 3px ${color})` }
                        : undefined
                    }
                  />
                )}
                {inFocus && complete && (
                  <circle
                    r={3.5}
                    fill={color}
                  >
                    <animateMotion
                      dur="6s"
                      repeatCount="indefinite"
                      rotate="auto"
                    >
                      <mpath href={`#req-outline-${req.key}`} />
                    </animateMotion>
                    <animate
                      attributeName="opacity"
                      values="0;1;1;0.2;1;0"
                      keyTimes="0;0.05;0.9;0.94;0.97;1"
                      dur="6s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="r"
                      values="3.5;3.5;3.5;6;2;3.5"
                      keyTimes="0;0.05;0.9;0.94;0.97;1"
                      dur="6s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {frac > 0.001 && (
                  <path
                    d={arcPath(req.outerR, mid - halfSpan, mid + halfSpan)}
                    fill="none"
                    stroke={color}
                    strokeWidth={complete ? 3 : 2}
                    strokeLinecap="round"
                    opacity={dim ? 0.25 : complete ? 0.85 : 0.6}
                  />
                )}
              </g>
            );
          })}

          {/* Edges between adjacent projects. Each end paints only its half,
              so a road is complete only when both projects are done. */}
          {edges.map((e) => {
            if (infoMode && e.titleIndex === selectedTitle) return null;
            const color = SEGMENT_COLORS[e.titleIndex % SEGMENT_COLORS.length];
            const half = (d: string, projectId: number, side: string) => {
              const validated = projects[projectId]
                ? getProjectProgress(projects[projectId], cursus, {}).projects >
                  0
                : false;
              const isPlanned = Boolean(planned[projectId]);
              if (!validated && !isPlanned) return null;
              const active =
                selectedProject === null ||
                selectedProject === projectId ||
                selectedTitle === e.titleIndex;
              return (
                <path
                  key={`${e.key}-${side}`}
                  d={d}
                  fill="none"
                  pathLength={1}
                  stroke={validated ? color : "#38bdf8"}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeDasharray="0.5 1"
                  opacity={active ? (validated ? 0.75 : 0.55) : 0.1}
                />
              );
            };
            return (
              <g key={`edge-${e.key}`}>
                {half(e.edgeAB, e.aId, "a")}
                {half(e.edgeBA, e.bId, "b")}
              </g>
            );
          })}

          {/* Piscine children. */}
          {children.map((c) => {
            if (infoMode && c.titleIndex === selectedTitle) return null;
            const dim =
              (selectedTitle !== null && c.titleIndex !== selectedTitle) ||
              selectedProject !== null;
            return (
              <g
                key={`child-${c.key}`}
                opacity={dim ? 0.1 : 0.85}
              >
                <line
                  x1={c.px}
                  y1={c.py}
                  x2={c.x}
                  y2={c.y}
                  className="stroke-muted-foreground/30"
                  strokeWidth={1}
                />
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={CHILD_R}
                  className="fill-muted-foreground/50"
                />
              </g>
            );
          })}

          {/* Links between every instance of the selected project. */}
          {selectedNodes.map((n) => (
            <line
              key={`sel-${n.key}`}
              x1={CENTER}
              y1={CENTER}
              x2={n.x}
              y2={n.y}
              className="stroke-sky-400/60"
              strokeWidth={2.5}
              strokeDasharray="4 6"
            />
          ))}

          {/* Donut segments (certificates) with curved labels. */}
          {segments.map((s, i) => {
            const sel = selectedTitle === i;
            const num = s.title.type.endsWith("7") ? 7 : 6;
            const label = `RNCP ${num} · ${shortTitle(s.title)}`;
            const rLabel = (DONUT_INNER + DONUT_OUTER) / 2;
            const pad = 0.04;
            // reverse the arc for bottom-half segments so text stays upright
            const bottom = Math.cos(s.mid) < 0;
            const labelArc = bottom
              ? arcPath(rLabel, s.a1 - pad, s.a0 + pad)
              : arcPath(rLabel, s.a0 + pad, s.a1 - pad);
            const arcLen = rLabel * (s.a1 - s.a0 - 2 * pad);
            // JetBrains Mono advance width ≈ 0.6em; leave a small margin so the
            // curved label fits the arc without clipping either end.
            const fontSize = Math.max(
              6,
              Math.min(13, (arcLen * 0.92) / (label.length * 0.62)),
            );
            return (
              // biome-ignore lint/a11y/useSemanticElements: An SVG group cannot be replaced by an HTML button; keyboard interaction is provided.
              <g
                key={`seg-${i}`}
                onPointerDown={(e) => e.stopPropagation()}
                role="button"
                tabIndex={0}
                aria-label={`Focus ${s.title.title}`}
                aria-pressed={sel}
                onClick={() => selectTitle(i)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectTitle(i);
                  }
                }}
                className="cursor-pointer"
              >
                <path
                  d={annularSector(DONUT_INNER, DONUT_OUTER, s.a0, s.a1)}
                  fill={s.color}
                  fillOpacity={sel ? 1 : 0.85}
                  className="stroke-background"
                  strokeWidth={3}
                  style={
                    sel
                      ? { filter: `drop-shadow(0 0 8px ${s.color})` }
                      : undefined
                  }
                />
                <path
                  id={`label-arc-${i}`}
                  d={labelArc}
                  fill="none"
                />
                <text
                  fontSize={fontSize}
                  dominantBaseline="central"
                  className="fill-black/80 font-semibold"
                >
                  <textPath
                    href={`#label-arc-${i}`}
                    startOffset="50%"
                    textAnchor="middle"
                  >
                    {label}
                  </textPath>
                </text>
              </g>
            );
          })}

          {/* Project nodes. */}
          {nodes.map((n) => {
            if (infoMode && n.titleIndex === selectedTitle) return null;
            const sel = n.projectId === selectedProject;
            const active = isActive(n.titleIndex, n.projectId);
            const validated = projects[n.projectId]
              ? getProjectProgress(projects[n.projectId], cursus, {}).projects >
                0
              : false;
            const isPlanned = Boolean(planned[n.projectId]);
            return (
              // biome-ignore lint/a11y/useSemanticElements: An SVG circle cannot be replaced by an HTML button; keyboard interaction is provided.
              <circle
                key={`node-${n.key}`}
                cx={n.x}
                cy={n.y}
                r={sel ? NODE_R + 4 : NODE_R}
                onPointerDown={(e) => e.stopPropagation()}
                role="button"
                tabIndex={0}
                aria-label={`${validated ? "Focus" : "Simulate completing"} ${n.name}`}
                aria-pressed={isPlanned}
                onClick={() => selectProject(n.projectId)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectProject(n.projectId);
                  }
                }}
                className={cn(
                  "cursor-pointer",
                  validated
                    ? "fill-primary"
                    : isPlanned
                      ? "fill-sky-500"
                      : "fill-muted-foreground/40",
                )}
                stroke={sel ? "#38bdf8" : n.shared ? "#e5e7eb" : "none"}
                strokeWidth={sel ? 4 : n.shared ? 2.5 : 0}
                opacity={active ? 1 : 0.18}
              />
            );
          })}

          {/* Info mode, pass 1: all requirement gauges. */}
          {infoMode &&
            requirements
              .filter((req) => req.titleIndex === selectedTitle)
              .map((req) => {
                const option = titles[req.titleIndex]?.options[req.optionIndex];
                if (!option) return null;
                const prog = optionProgress(option, cursus, planned);
                const color =
                  SEGMENT_COLORS[req.titleIndex % SEGMENT_COLORS.length];
                const pad = (req.a1 - req.a0) * 0.06;
                const a0 = req.a0 + pad;
                const a1 = req.a1 - pad;
                const span = a1 - a0;
                const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

                const needP = option.numberOfProjects || 1;
                const realP = clamp01(prog.projects / needP);
                const simP = clamp01(
                  (prog.projects + prog.simulatedProjects) / needP,
                );
                const needX = option.experience;
                const realX = needX > 0 ? clamp01(prog.experience / needX) : 0;
                const simX =
                  needX > 0
                    ? clamp01(
                        (prog.experience + prog.simulatedExperience) / needX,
                      )
                    : 0;

                const gauge = (
                  radius: number,
                  real: number,
                  sim: number,
                  gkey: string,
                ) => (
                  <g key={gkey}>
                    <path
                      d={arcPath(radius, a0, a1)}
                      fill="none"
                      strokeLinecap="round"
                      strokeWidth={13}
                      className="stroke-secondary"
                    />
                    {sim > 0 && (
                      <path
                        d={arcPath(radius, a0, a0 + span * sim)}
                        fill="none"
                        strokeLinecap="round"
                        strokeWidth={13}
                        className="stroke-sky-500"
                      />
                    )}
                    {real > 0 && (
                      <path
                        d={arcPath(radius, a0, a0 + span * real)}
                        fill="none"
                        strokeLinecap="round"
                        strokeWidth={13}
                        stroke={color}
                      />
                    )}
                  </g>
                );

                return (
                  <g key={`info-gauge-${req.key}`}>
                    {gauge(rScale(258), realP, simP, `gp-${req.key}`)}
                    {needX > 0 &&
                      gauge(rScale(222), realX, simX, `gx-${req.key}`)}
                  </g>
                );
              })}

          {/* Info mode, pass 2: requirement text, rendered above EVERY gauge. */}
          {infoMode &&
            requirements
              .filter((req) => req.titleIndex === selectedTitle)
              .map((req) => {
                const option = titles[req.titleIndex]?.options[req.optionIndex];
                if (!option) return null;
                const prog = optionProgress(option, cursus, planned);
                const color =
                  SEGMENT_COLORS[req.titleIndex % SEGMENT_COLORS.length];
                const needX = option.experience;
                const namePos = polar(rScale(306), (req.a0 + req.a1) / 2);

                return (
                  <g key={`info-text-${req.key}`}>
                    {prog.isComplete && (
                      <text
                        x={namePos.x}
                        y={namePos.y - 26}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={16}
                        className="font-bold"
                        style={{ fill: color }}
                      >
                        ✓ complete
                      </text>
                    )}
                    <text
                      x={namePos.x}
                      y={namePos.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      paintOrder="stroke"
                      stroke="var(--color-background)"
                      strokeWidth={5}
                      strokeLinejoin="round"
                      className="fill-foreground font-semibold"
                      fontSize={22}
                    >
                      {option.title}
                    </text>
                    <text
                      x={namePos.x}
                      y={namePos.y + 24}
                      textAnchor="middle"
                      dominantBaseline="central"
                      paintOrder="stroke"
                      stroke="var(--color-background)"
                      strokeWidth={4}
                      strokeLinejoin="round"
                      className="fill-muted-foreground"
                      fontSize={15}
                    >
                      {prog.projects + prog.simulatedProjects}/
                      {option.numberOfProjects} proj
                      {needX > 0
                        ? ` · ${Math.round(
                            (prog.experience + prog.simulatedExperience) / 1000,
                          )}k/${Math.round(needX / 1000)}k XP`
                        : ""}
                    </text>
                  </g>
                );
              })}
        </g>
      </svg>

      {/* Zoom controls. */}
      <div className="absolute top-3 right-3 flex flex-col overflow-hidden rounded-md border bg-background/90 shadow-sm">
        <button
          type="button"
          aria-label="Zoom in"
          className="flex size-8 items-center justify-center hover:bg-muted"
          onClick={() => zoomAt(SIZE / 2, SIZE / 2, 1.25)}
        >
          <Plus className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          className="flex size-8 items-center justify-center border-t hover:bg-muted"
          onClick={() => zoomAt(SIZE / 2, SIZE / 2, 1 / 1.25)}
        >
          <Minus className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Reset view"
          className="flex size-8 items-center justify-center border-t hover:bg-muted"
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
        >
          <Scan className="size-4" />
        </button>
      </div>

      {/* Spread slider: separates the nodes (bigger graph) without zooming. */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-1 rounded-md border bg-background/90 px-1.5 py-2 shadow-sm">
        <input
          type="range"
          min={0.6}
          max={2.6}
          step={0.05}
          value={spread}
          onChange={(e) => setSpread(Number(e.target.value))}
          aria-label="Spread nodes"
          title="Spread nodes apart"
          className="h-28 w-2 cursor-pointer accent-primary"
          style={{ writingMode: "vertical-lr", direction: "rtl" }}
        />
        <span className="text-[10px] text-muted-foreground">spread</span>
        <div className="my-1 h-px w-full bg-border" />
        <button
          type="button"
          onClick={() => setFixPiscines((v) => !v)}
          aria-pressed={fixPiscines}
          title="Treat piscines as 11,000 XP (graph only)"
          className={cn(
            "rounded px-1 py-0.5 text-center text-[9px] font-medium leading-tight",
            fixPiscines
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          fix
          <br />
          piscines
        </button>
      </div>

      {selectedName && (
        <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 rounded-full border bg-background/90 px-3 py-1 font-medium text-sm shadow-sm">
          {selectedName}
          {new Set(selectedNodes.map((n) => n.titleIndex)).size > 1 && (
            <span className="ml-2 text-sky-500">
              in {new Set(selectedNodes.map((n) => n.titleIndex)).size} certs
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-2 border-t bg-background/60 px-4 py-2 text-xs">
        {/* Legend: one row per RNCP level. */}
        <div className="space-y-1">
          {[6, 7].map((level) => (
            <div
              key={`legend-row-${level}`}
              className="flex flex-wrap items-center gap-x-4 gap-y-1"
            >
              <span className="w-14 shrink-0 font-semibold text-muted-foreground">
                RNCP {level}
              </span>
              {segments
                .map((s, i) => ({ s, i }))
                .filter(
                  ({ s }) => (s.title.type.endsWith("7") ? 7 : 6) === level,
                )
                .map(({ s, i }) => (
                  <span
                    key={`legend-${i}`}
                    className="flex items-center gap-1.5"
                  >
                    <span
                      className="inline-block size-3 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-muted-foreground">
                      {shortTitle(s.title)}
                    </span>
                  </span>
                ))}
            </div>
          ))}
        </div>

        {/* Instructions: one per row. */}
        <div className="space-y-0.5 text-muted-foreground sm:text-right">
          <div>Scroll to zoom · drag to pan</div>
          <div>Click a project to simulate it</div>
          <div>Click a cert twice for its requirement summary</div>
        </div>
      </div>
    </div>
  );
}
