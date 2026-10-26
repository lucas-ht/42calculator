import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useFortyTwoStore } from "@/providers/forty-two-store-provider";
import { usePlannedProjects } from "@/stores/planned-projects-store";
import type { FortyTwoProject } from "@/types/forty-two";
import {
  CircleCheck,
  CircleDashed,
  ChevronsUpDownIcon,
  CornerDownRightIcon,
  CircleXIcon,
  CircleDotIcon,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

function ProjectSideIcon({
  project,
  depth,
}: { project: FortyTwoProject; depth: number }) {
  if (project.children.length > 0) {
    return (
      <CollapsibleTrigger className="cursor-pointer">
        <ChevronsUpDownIcon className="mr-2 size-4" />
      </CollapsibleTrigger>
    );
  }

  if (depth > 0) {
    return (
      <CornerDownRightIcon className="mr-2 size-4 text-muted-foreground/50" />
    );
  }

  return <span className="w-6" />;
}

function ProjectIcon({
  project,
  isSimulated,
}: { project: FortyTwoProject; isSimulated: boolean }) {
  const { cursus } = useFortyTwoStore((state) => state);
  const userProject = cursus.projects[project.id];
  const isValidated: boolean = userProject?.is_validated ?? false;

  if (isValidated) {
    return <CircleCheck className="mr-2 size-4 text-primary" />;
  }

  if (isSimulated) {
    return <CircleCheck className="mr-2 size-4 text-sky-500" />;
  }

  if (!userProject) {
    return <CircleDashed className="mr-2 size-4" />;
  }

  if (userProject.status !== "finished") {
    return <CircleDotIcon className="mr-2 size-4 text-muted-foreground" />;
  }

  return <CircleXIcon className="mr-2 size-4 text-destructive" />;
}

function ProjectExperience({ project }: { project: FortyTwoProject }) {
  const { cursus } = useFortyTwoStore((state) => state);
  const userProject = cursus.projects[project.id];
  const isValidated: boolean = userProject?.is_validated ?? false;

  if (project.experience === 0) {
    return null;
  }

  return (
    <div className="space-x-2">
      <Badge
        className="rounded-lg"
        variant="secondary"
      >
        {project.experience?.toLocaleString() ?? 0} XP
      </Badge>

      {isValidated && <Badge className="rounded-lg">{userProject.mark}</Badge>}
    </div>
  );
}

function Project({
  project,
  depth = 0,
}: { project: FortyTwoProject; depth?: number }) {
  const { cursus } = useFortyTwoStore((state) => state);
  const toggle = usePlannedProjects((state) => state.toggle);
  const isSimulated = usePlannedProjects((state) =>
    Boolean(state.planned[project.id]),
  );

  const isValidated = cursus.projects[project.id]?.is_validated ?? false;
  // Only top-level option projects feed the requirement bars, and an
  // already-validated project can't be improved by simulating it.
  const isSimulatable = depth === 0 && !isValidated;

  const content = (
    <>
      <p className="ml-1 truncate">{project.name}</p>
      <ProjectExperience project={project} />
    </>
  );

  return (
    <Collapsible>
      <div
        key={project.id}
        className={cn(
          "flex min-h-[42px] items-center rounded-md text-sm transition-colors",
          isSimulated && "bg-sky-500/10",
        )}
      >
        <ProjectIcon
          project={project}
          isSimulated={isSimulated}
        />

        <ProjectSideIcon
          project={project}
          depth={depth}
        />

        {isSimulatable ? (
          <button
            type="button"
            onClick={() => toggle(project.id)}
            aria-pressed={isSimulated}
            aria-label={`Simulate completing ${project.name}`}
            title="Click to simulate completing this project"
            className="flex-1 cursor-pointer rounded-md py-1 pr-1 text-left hover:bg-muted/60"
          >
            {content}
          </button>
        ) : (
          <div className="flex-1 py-1 pr-1">{content}</div>
        )}
      </div>

      <CollapsibleContent>
        <div className="mt-2 ml-4 space-y-2">
          {project.children.map((child) => (
            <Project
              key={child.id}
              project={child}
              depth={depth + 1}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ProjectList({
  projects,
}: {
  projects: Record<number, FortyTwoProject>;
}) {
  return (
    <ScrollArea className="h-[442px]">
      <div className="space-y-2">
        {Object.values(projects).map((project) => {
          return (
            <Project
              key={project.id}
              project={project}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
}
