import type { FortyTwoProject } from "@/types/forty-two";
import rules from "../../../data/rncp_rules_21.json";

type ProjectData = {
  id: number;
  name: string;
  difficulty: number;
  completions: number;
  duration: number;
  exam: boolean;
  parent?: { id: number } | null;
  children?: { id: number }[];
};

/** Keep a flat index for identity lookup, plus trees for project presentation. */
export function buildProjectIndex(data: ProjectData[]) {
  const projects: Record<number, FortyTwoProject> = {};
  for (const project of data) {
    if (project.exam) continue;
    projects[project.id] = {
      id: project.id,
      name: project.name,
      experience: project.difficulty,
      completions: project.completions,
      duration: project.duration,
      parentId: project.parent?.id,
      children: [],
    };
  }
  const groups = new Map(rules.piscines.map((rule) => [rule.id, rule]));
  for (const item of data) {
    const project = projects[item.id];
    if (!project) continue;
    const group = groups.get(item.id);
    const childIds =
      group?.project_ids ?? item.children?.map((child) => child.id) ?? [];
    project.children = childIds.flatMap((id) => {
      const child = projects[id];
      if (!child) return [];
      child.parentId = item.id;
      return [child];
    });
    project.completionProjectId = group?.final_project_id;
  }
  return projects;
}
