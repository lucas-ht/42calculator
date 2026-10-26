import type {
  FortyTwoCursus,
  FortyTwoProject,
  FortyTwoTitle,
} from "@/types/forty-two";
import rules from "../../../data/rncp_rules_21.json";
import type { Plan } from "./project-progress";

export function getGeneralProgress(
  title: FortyTwoTitle,
  cursus: FortyTwoCursus,
  planned: Plan,
) {
  const cores = rules.core_project_ids.flatMap((id) =>
    cursus.projects[id]?.is_validated ? [cursus.projects[id]] : [],
  );
  const coreComplete = cores.length > 0;
  const coreSimulated =
    !coreComplete &&
    rules.core_project_ids.some((id) => (planned[id]?.mark ?? 0) > 0);
  const completionDates = cores.flatMap((project) =>
    project.markedAt === undefined ? [] : [project.markedAt],
  );
  const completedAt = completionDates.length
    ? Math.min(...completionDates)
    : undefined;
  const groups = new Set(rules.group_project_ids);
  let groupProjects = 0;
  let simulatedGroupProjects = 0;
  for (const project of Object.values(cursus.projects)) {
    if (
      coreComplete &&
      completedAt !== undefined &&
      project.is_validated &&
      groups.has(project.id) &&
      !rules.core_project_ids.includes(project.id) &&
      project.markedAt !== undefined &&
      project.markedAt > completedAt
    )
      groupProjects++;
  }
  if (coreComplete || coreSimulated) {
    for (const id of Object.keys(planned).map(Number)) {
      if (
        groups.has(id) &&
        !rules.core_project_ids.includes(id) &&
        !cursus.projects[id]?.is_validated &&
        planned[id].mark > 0
      )
        simulatedGroupProjects++;
    }
  }
  const experiences = Object.values(title.experience).filter(
    (project) => cursus.projects[project.id]?.is_validated,
  );
  return {
    coreComplete,
    coreSimulated,
    groupProjects,
    simulatedGroupProjects,
    requiredGroupProjects: rules.number_of_group_projects,
    experiences,
  };
}

export function getBaseExperience(project: FortyTwoProject): number {
  return (
    project.experience +
    project.children.reduce((sum, child) => sum + getBaseExperience(child), 0)
  );
}
