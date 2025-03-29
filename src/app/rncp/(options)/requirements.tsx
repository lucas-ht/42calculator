import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFortyTwoStore } from "@/providers/forty-two-store-provider";
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
}

function TitleRequirement({ name, value, max, unit }: TitleRequirementProps) {
  function formatValue(value: number) {
    if (value > 1000) {
      return `${(value / 1000).toFixed(1).toLocaleString()}K`;
    }
    return value.toLocaleString();
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-1 text-sm">
        <p className="truncate">{name}</p>
        <p className="min-w-[66px] text-right font-medium">
          {formatValue(value)} / {formatValue(max)} {unit}
        </p>
      </div>
      <Progress
        max={max}
        value={value > max ? max : value}
        aria-label={`${value} out of ${max} for the ${name.toLowerCase()}`}
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
  const { cursus } = useFortyTwoStore((state) => state);

  const experiences: FortyTwoProject[] = [];
  for (const project of Object.values(cursus.projects)) {
    const isExperience: boolean = title.experience[project.id] !== undefined;
    if (isExperience && project.is_validated) {
      experiences.push(project);
    }
  }

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

function calculateExperience(
  project: FortyTwoProject,
  cursus: FortyTwoCursus,
): {
  experience: number;
  projects: number;
} {
  let projects = 0;
  let experience = 0;

  const userProject = cursus.projects[project.id];
  if (!userProject) {
    return { experience: 0, projects: 0 };
  }

  for (const child of userProject.children) {
    const childExperience = calculateExperience(child, cursus);
    projects += childExperience.projects;
    experience += childExperience.experience;
  }

  if (userProject.is_validated) {
    projects++;
    experience += (project.experience || 0) * ((userProject.mark || 0) / 100);
  }

  return { experience, projects };
}

export function TitleOptionRequirements({
  option,
}: { option: FortyTwoTitleOption }) {
  const { cursus } = useFortyTwoStore((state) => state);

  let projects = 0;
  let experience = 0;

  for (const project of Object.values(option.projects)) {
    const { experience: projectExperience, projects: projectCount } =
      calculateExperience(project, cursus);

    projects += projectCount;
    experience += projectExperience;
  }

  return (
    <div className="space-y-4">
      <TitleRequirement
        name={"Projects"}
        value={projects}
        max={option.numberOfProjects}
      />

      {option.experience > 0 && (
        <TitleRequirement
          name={"Experience"}
          value={experience}
          max={option.experience}
          unit="XP"
        />
      )}
    </div>
  );
}
