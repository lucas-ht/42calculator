import { getExperience, getLevel } from "@/lib/forty-two/forty-two-calculator";
import type {
  FortyTwoCursus,
  FortyTwoLevel,
  FortyTwoProject,
  FortyTwoTitle,
} from "@/types/forty-two";
import { getGeneralProgress } from "./general-progress";
import {
  getOptionProgress,
  getPlannedExperience,
  type Plan,
} from "./project-progress";

export function getTitleProgress(
  title: FortyTwoTitle,
  cursus: FortyTwoCursus,
  levels: Record<number, FortyTwoLevel>,
  projects: Record<number, FortyTwoProject>,
  planned: Plan,
) {
  const general = getGeneralProgress(title, cursus, planned);
  const xp = getPlannedExperience(cursus, planned, projects);
  const projected = getLevel(getExperience(cursus.level, levels) + xp, levels);
  const simulatedLevel = Math.max(0, projected - cursus.level);
  const options = [
    ...title.options,
    {
      title: "Suite",
      projects: title.suite,
      experience: 0,
      numberOfProjects: title.numberOfSuite,
    },
  ];
  const progress = options.map((option) =>
    getOptionProgress(option, cursus, planned),
  );
  const realCategoriesMet = progress.every(
    (value) => value.isComplete && !value.completedViaSimulation,
  );
  const sharedMet =
    cursus.events >= title.numberOfEvents &&
    general.experiences.length >= title.numberOfExperiences;
  const isComplete =
    sharedMet &&
    (general.coreComplete || general.coreSimulated) &&
    general.groupProjects + general.simulatedGroupProjects >=
      general.requiredGroupProjects &&
    cursus.level + simulatedLevel >= title.level &&
    progress.every((value) => value.isComplete);
  const realComplete =
    sharedMet &&
    general.coreComplete &&
    general.groupProjects >= general.requiredGroupProjects &&
    cursus.level >= title.level &&
    realCategoriesMet;
  return {
    ...general,
    simulatedLevel,
    isComplete,
    completedViaSimulation: isComplete && !realComplete,
  };
}
