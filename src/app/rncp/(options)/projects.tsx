import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFortyTwoStore } from "@/providers/forty-two-store-provider";
import type { FortyTwoProject } from "@/types/forty-two";
import {
  CircleCheck,
  CircleDashed,
  ChevronsUpDownIcon,
  CornerDownRightIcon,
  CircleXIcon,
  CircleDotIcon
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

function ProjectIcon({ project }: { project: FortyTwoProject }) {
  const { cursus } = useFortyTwoStore((state) => state);
  const userProject = cursus.projects[project.id];
  const isValidated: boolean = userProject?.is_validated ?? false;

  if (!userProject) {
    return <CircleDashed className="mr-2 size-4" />;
  }

  if (isValidated) {
    return <CircleCheck className="mr-2 size-4 text-primary" />;
  }

  if (userProject.status !== "finished") {
    return <CircleDotIcon className="mr-2 size-4 text-muted-foreground" />;
  }

  if (!isValidated) {
    return <CircleXIcon className="mr-2 size-4 text-destructive" />;
  }

  return <CircleDashed className="mr-2 size-4" />;
}

function Project({
  project,
  depth = 0,
}: { project: FortyTwoProject; depth?: number }) {
  const { cursus } = useFortyTwoStore((state) => state);
  const userProject = cursus.projects[project.id];
  const isValidated: boolean = userProject?.is_validated ?? false;

  return (
    <Collapsible>
      <div
        key={project.id}
        className="flex items-center text-sm"
      >
        <ProjectIcon project={project} />

        <ProjectSideIcon
          project={project}
          depth={depth}
        />

        <div>
          <p className="ml-1 truncate">{project.name}</p>

          <div className="space-x-2">
            <Badge
              className="rounded-lg"
              variant="secondary"
            >
              {project.experience?.toLocaleString() ?? 0} XP
            </Badge>

            {isValidated && project.children.length === 0 && (
              <Badge className="rounded-lg">
                {cursus.projects[project.id].mark}
              </Badge>
            )}
          </div>
        </div>
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
