import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOptionProgress } from "@/lib/rncp/project-progress";
import { getTitleProgress } from "@/lib/rncp/title-progress";
import { useFortyTwoStore } from "@/providers/forty-two-store-provider";
import { usePlannedProjects } from "@/stores/planned-projects-store";
import type { FortyTwoTitle, FortyTwoTitleOption } from "@/types/forty-two";
import { TitleRequirement } from "./requirement-bar";

export function TitleRequirements({
  title,
  className,
}: {
  title: FortyTwoTitle;
  className?: string;
}) {
  const { cursus, levels, projects } = useFortyTwoStore((state) => state);
  const planned = usePlannedProjects((state) => state.planned);
  const progress = getTitleProgress(title, cursus, levels, projects, planned);
  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle tag="h3">Requirements</CardTitle>
          {progress.isComplete && (
            <Badge
              variant={
                progress.completedViaSimulation ? "secondary" : "default"
              }
            >
              {progress.completedViaSimulation
                ? "Simulated"
                : "Requirements met"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm">Common core</p>
          <Badge variant={progress.coreComplete ? "default" : "secondary"}>
            {progress.coreComplete
              ? "Validated"
              : progress.coreSimulated
                ? "Simulated"
                : "Not validated"}
          </Badge>
        </div>
        <TitleRequirement
          name="Post-core group projects"
          value={progress.groupProjects}
          simulatedValue={progress.simulatedGroupProjects}
          max={progress.requiredGroupProjects}
        />
        <TitleRequirement
          name="Level required"
          value={cursus.level}
          simulatedValue={progress.simulatedLevel}
          max={title.level}
        />
        <TitleRequirement
          name="Number of events"
          value={cursus.events}
          max={title.numberOfEvents}
        />
        <TitleRequirement
          name="Professional experiences"
          value={progress.experiences.length}
          max={title.numberOfExperiences}
        />
      </CardContent>
    </Card>
  );
}

export function useTitleOptionProgress(option: FortyTwoTitleOption) {
  const { cursus } = useFortyTwoStore((state) => state);
  const planned = usePlannedProjects((state) => state.planned);
  return getOptionProgress(option, cursus, planned);
}

export function TitleOptionRequirements({
  option,
}: {
  option: FortyTwoTitleOption;
}) {
  const { projects, experience, simulatedProjects, simulatedExperience } =
    useTitleOptionProgress(option);
  return (
    <div className="flex flex-col gap-4">
      <TitleRequirement
        name="Projects"
        value={projects}
        simulatedValue={simulatedProjects}
        max={option.numberOfProjects}
      />
      {option.experience > 0 && (
        <TitleRequirement
          name="Experience"
          value={experience}
          simulatedValue={simulatedExperience}
          max={option.experience}
          unit="XP"
        />
      )}
    </div>
  );
}
