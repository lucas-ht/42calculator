import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompletionBar } from "@/components/ui/completion-bar";
import {
  calculateExperience as gradedExperience,
  getExperience,
  getLevel,
} from "@/lib/forty-two/forty-two-calculator";
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

interface TitleRequirementProps {
  name: string;
  value: number;
  max: number;
  unit?: string;
  /** Extra amount coming from simulated (not yet earned) projects. */
  simulatedValue?: number;
}

function TitleRequirement({
  name,
  value,
  max,
  unit,
  simulatedValue = 0,
}: TitleRequirementProps) {
  function formatValue(value: number) {
    if (value > 1000) {
      return `${(value / 1000).toFixed(1).toLocaleString()}K`;
    }
    return value.toLocaleString();
  }

  const total = value + simulatedValue;
  const percentage = max > 0 ? (total / max) * 100 : 0;
  const isOver = total > max;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 px-1 text-sm">
        <p className="truncate">{name}</p>
        <p className="text-right font-medium tabular-nums">
          {formatValue(value)}
          {simulatedValue > 0 && (
            <span className="text-sky-600 dark:text-sky-400">
              {" +"}
              {formatValue(simulatedValue)}
            </span>
          )}
          {" / "}
          {formatValue(max)} {unit}
          {isOver && (
            <span className="ml-1 font-normal text-muted-foreground text-xs">
              ({Math.round(percentage)}%)
            </span>
          )}
        </p>
      </div>
      <CompletionBar
        value={value}
        simulatedValue={simulatedValue}
        max={max}
        aria-label={`${total} out of ${max} for the ${name.toLowerCase()}`}
      />
    </div>
  );
}

export interface TitleRequirementsProps {
  title: FortyTwoTitle;
  className?: string;
}

export function TitleRequirements({
  title,
  className,
}: TitleRequirementsProps) {
  const { cursus, levels, projects } = useFortyTwoStore((state) => state);
  const planned = usePlannedProjects((state) => state.planned);

  const experiences: FortyTwoProject[] = [];
  for (const project of Object.values(cursus.projects)) {
    const isExperience: boolean = title.experience[project.id] !== undefined;
    if (isExperience && project.is_validated) {
      experiences.push(project);
    }
  }

  // Project the cursus level forward with the XP from every simulated project
  // (graded by its mark/bonus), so "Level required" reflects the simulation.
  let simulatedXp = 0;
  for (const [id, config] of Object.entries(planned)) {
    const project = projects[Number(id)];
    if (!project) continue;
    simulatedXp += gradedExperience(
      project.experience || 0,
      config.mark ?? 100,
      config.bonus ?? false,
    );
  }
  const projectedLevel = getLevel(
    getExperience(cursus.level, levels) + simulatedXp,
    levels,
  );
  const simulatedLevel = Math.max(0, projectedLevel - cursus.level);

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle
          tag="h3"
          className="text-xl"
        >
          Requirements
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-3">
        <TitleRequirement
          name={"Level required"}
          value={cursus.level}
          simulatedValue={simulatedLevel}
          max={title.level}
        />
        <TitleRequirement
          name={"Number of events"}
          value={cursus.events}
          max={title.numberOfEvents}
        />
        <TitleRequirement
          name={"Professional experiences"}
          value={experiences.length}
          max={title.numberOfExperiences}
        />
      </CardContent>
    </Card>
  );
}

interface Contribution {
  experience: number;
  projects: number;
  simulatedExperience: number;
  simulatedProjects: number;
}

function calculateExperience(
  project: FortyTwoProject,
  cursus: FortyTwoCursus,
  plannedConfig: (projectId: number) => PlannedProject | undefined,
): Contribution {
  let projects = 0;
  let experience = 0;
  let simulatedProjects = 0;
  let simulatedExperience = 0;

  const userProject = cursus.projects[project.id];

  for (const child of userProject?.children ?? []) {
    const c = calculateExperience(child, cursus, plannedConfig);
    projects += c.projects;
    experience += c.experience;
    simulatedProjects += c.simulatedProjects;
    simulatedExperience += c.simulatedExperience;
  }

  const config = plannedConfig(project.id);
  if (userProject?.is_validated) {
    projects++;
    experience += (project.experience || 0) * ((userProject.mark || 0) / 100);
  } else if (config) {
    // Simulated completion, graded by the mark/bonus the user set (same as the
    // calculator), tracked separately so the UI can show it is not real.
    simulatedProjects++;
    simulatedExperience += gradedExperience(
      project.experience || 0,
      config.mark ?? 100,
      config.bonus ?? false,
    );
  }

  return { experience, projects, simulatedExperience, simulatedProjects };
}

export interface TitleOptionProgress {
  projects: number;
  experience: number;
  simulatedProjects: number;
  simulatedExperience: number;
  projectsMet: boolean;
  experienceMet: boolean;
  /** Both requirements met (counting simulated projects). */
  isComplete: boolean;
  /** Complete only because of simulated projects (not real completions). */
  completedViaSimulation: boolean;
}

export function useTitleOptionProgress(
  option: FortyTwoTitleOption,
): TitleOptionProgress {
  const { cursus } = useFortyTwoStore((state) => state);
  const planned = usePlannedProjects((state) => state.planned);
  const plannedConfig = (projectId: number) => planned[projectId];

  let projects = 0;
  let experience = 0;
  let simulatedProjects = 0;
  let simulatedExperience = 0;

  for (const project of Object.values(option.projects)) {
    const c = calculateExperience(project, cursus, plannedConfig);

    projects += c.projects;
    experience += c.experience;
    simulatedProjects += c.simulatedProjects;
    simulatedExperience += c.simulatedExperience;
  }

  const projectsMet = projects + simulatedProjects >= option.numberOfProjects;
  const experienceMet =
    option.experience === 0 ||
    experience + simulatedExperience >= option.experience;
  const realProjectsMet = projects >= option.numberOfProjects;
  const realExperienceMet =
    option.experience === 0 || experience >= option.experience;

  const isComplete = projectsMet && experienceMet;
  const completedViaSimulation =
    isComplete && !(realProjectsMet && realExperienceMet);

  return {
    projects,
    experience,
    simulatedProjects,
    simulatedExperience,
    projectsMet,
    experienceMet,
    isComplete,
    completedViaSimulation,
  };
}

export function TitleOptionRequirements({
  option,
}: { option: FortyTwoTitleOption }) {
  const { projects, experience, simulatedProjects, simulatedExperience } =
    useTitleOptionProgress(option);

  return (
    <div className="space-y-4">
      <TitleRequirement
        name={"Projects"}
        value={projects}
        simulatedValue={simulatedProjects}
        max={option.numberOfProjects}
      />

      {option.experience > 0 && (
        <TitleRequirement
          name={"Experience"}
          value={experience}
          simulatedValue={simulatedExperience}
          max={option.experience}
          unit="XP"
        />
      )}
    </div>
  );
}
