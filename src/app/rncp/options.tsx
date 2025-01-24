import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { fortyTwoStore } from "@/providers/forty-two-store-provider";
import type {
  FortyTwoProject,
  FortyTwoTitle,
  FortyTwoTitleOption,
} from "@/types/forty-two";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import {
  CircleCheck,
  CircleDashed,
  ChevronsUpDownIcon,
  CornerDownRightIcon,
} from "lucide-react";
import { TitleOptionRequirements } from "./requirements";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

function ProjectIcon({
  project,
  depth,
}: { project: FortyTwoProject; depth: number }) {
  if (project.children.length > 0) {
    return (
      <CollapsibleTrigger>
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

function Project({
  project,
  depth = 0,
}: { project: FortyTwoProject; depth?: number }) {
  const { cursus } = fortyTwoStore.getState();
  const isCompleted: boolean = cursus.projects[project.id] !== undefined;

  return (
    <Collapsible>
      <div
        key={project.id}
        className="flex items-center text-sm"
      >
        {isCompleted ? (
          <CircleCheck className="mr-2 size-4 text-primary" />
        ) : (
          <CircleDashed className="mr-2 size-4" />
        )}

        <ProjectIcon
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

            {isCompleted && project.children.length === 0 && (
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

function ProjectList({
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

function TitleOption({ option }: { option: FortyTwoTitleOption }) {
  return (
    <Card className="min-h-[638px]">
      <CardHeader className="pb-4">
        <CardTitle
          tag="h3"
          className="truncate text-xl"
        >
          {option.title}
        </CardTitle>
        <TitleOptionRequirements option={option} />
      </CardHeader>
      <CardContent className="p-4 md:p-6 md:pt-0">
        <ProjectList projects={option.projects} />
      </CardContent>
    </Card>
  );
}

export interface TitleOptionsProps {
  title: FortyTwoTitle;
  className?: string;
}

export function TitleOptions({ title, className }: TitleOptionsProps) {
  const options: FortyTwoTitleOption[] = [
    ...title.options,
    {
      title: "Suite",
      experience: 0,
      numberOfProjects: title.numberOfSuite,
      projects: title.suite,
    },
  ];

  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className={cn("w-full px-8", className)}
      plugins={[WheelGesturesPlugin()]}
    >
      <CarouselContent>
        {options.map((option) => (
          <CarouselItem
            key={option.title}
            className="md:basis-1/2 xl:basis-1/3"
          >
            <TitleOption option={option} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="-left-2 md:-left-3" />
      <CarouselNext className="-right-2 md:-right-3" />
    </Carousel>
  );
}
