import { calculateExperience } from "@/lib/forty-two/forty-two-calculator";
import type { PlannedProject } from "@/stores/planned-projects-store";
import type {
  FortyTwoCursus,
  FortyTwoProject,
  FortyTwoTitleOption,
} from "@/types/forty-two";

export type Plan = Record<number, PlannedProject>;
export interface Contribution {
  projects: number;
  experience: number;
  simulatedProjects: number;
  simulatedExperience: number;
}

export function getProjectProgress(
  project: FortyTwoProject,
  cursus: FortyTwoCursus,
  planned: Plan,
): Contribution {
  const terminalId = project.completionProjectId ?? project.id;
  const completed = cursus.projects[terminalId]?.is_validated === true;
  const inherited = planned[project.id];
  const terminalConfig =
    planned[terminalId] ?? inherited?.children?.[terminalId] ?? inherited;
  const simulated = !completed && !!terminalConfig && terminalConfig.mark > 0;
  const seen = new Set<number>();
  let experience = 0;
  let simulatedExperience = 0;
  function sum(node: FortyTwoProject, parentConfig?: PlannedProject) {
    if (seen.has(node.id)) return;
    seen.add(node.id);
    const actual = cursus.projects[node.id];
    const config =
      planned[node.id] ?? parentConfig?.children?.[node.id] ?? parentConfig;
    if (actual?.is_validated) {
      experience += calculateExperience(
        node.experience,
        actual.mark ?? 0,
        false,
      );
    } else if (config) {
      simulatedExperience += calculateExperience(
        node.experience,
        config.mark,
        config.bonus,
      );
    }
    for (const child of node.children) sum(child, config);
  }
  sum(project, inherited);
  return {
    projects: Number(completed),
    simulatedProjects: Number(simulated),
    experience,
    simulatedExperience,
  };
}

export function getOptionProgress(
  option: FortyTwoTitleOption,
  cursus: FortyTwoCursus,
  planned: Plan,
) {
  const totals: Contribution = {
    projects: 0,
    experience: 0,
    simulatedProjects: 0,
    simulatedExperience: 0,
  };
  for (const project of Object.values(option.projects)) {
    const contribution = getProjectProgress(project, cursus, planned);
    for (const key of Object.keys(totals) as (keyof Contribution)[])
      totals[key] += contribution[key];
  }
  const projectsMet =
    totals.projects + totals.simulatedProjects >= option.numberOfProjects;
  const experienceMet =
    totals.experience + totals.simulatedExperience >= option.experience;
  const isComplete = projectsMet && experienceMet;
  return {
    ...totals,
    projectsMet,
    experienceMet,
    isComplete,
    completedViaSimulation:
      isComplete &&
      !(
        totals.projects >= option.numberOfProjects &&
        totals.experience >= option.experience
      ),
  };
}

export function getPlannedExperience(
  cursus: FortyTwoCursus,
  planned: Plan,
  projects: Record<number, FortyTwoProject>,
) {
  let experience = 0;
  for (const id of Object.keys(planned)) {
    const project = projects[Number(id)];
    if (!project || (project.parentId && planned[project.parentId])) continue;
    experience += getProjectProgress(
      project,
      cursus,
      planned,
    ).simulatedExperience;
  }
  return experience;
}
