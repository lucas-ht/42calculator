import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { FortyTwoTitle, FortyTwoTitleOption } from "@/types/forty-two";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { CircleCheck } from "lucide-react";
import { TitleOptionRequirements, useTitleOptionProgress } from "./requirements";
import { ProjectList } from "./projects";

function TitleOption({ option }: { option: FortyTwoTitleOption }) {
  const { isComplete, completedViaSimulation } = useTitleOptionProgress(option);

  return (
    <Card
      className={cn(
        "min-h-[638px] transition-all duration-500",
        isComplete &&
          !completedViaSimulation &&
          "border-primary/70 shadow-[0_0_24px_-6px] shadow-primary/60",
        completedViaSimulation &&
          "border-sky-500/70 shadow-[0_0_24px_-6px] shadow-sky-500/60",
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle
            tag="h3"
            className="truncate text-xl"
          >
            {option.title}
          </CardTitle>
          {isComplete && (
            <Badge
              className={cn(
                "shrink-0 gap-1 whitespace-nowrap",
                completedViaSimulation
                  ? "bg-sky-500 text-white hover:bg-sky-500"
                  : "bg-primary",
              )}
            >
              <CircleCheck className="size-3.5" />
              {completedViaSimulation ? "Simulated" : "Complete"}
            </Badge>
          )}
        </div>
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
