import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { fortyTwoStore } from '@/providers/forty-two-store-provider'
import {
  FortyTwoProject,
  FortyTwoTitle,
  FortyTwoTitleOption
} from '@/types/forty-two'
import { CircleCheck, CircleDashed } from 'lucide-react'
import { TitleOptionRequirements } from './requirements'

function ProjectList({
  projects
}: {
  projects: Record<number, FortyTwoProject>
}) {
  const { cursus } = fortyTwoStore.getState()

  return (
    <ScrollArea className="h-[442px]">
      <div className="space-y-2">
        {Object.values(projects).map((project) => {
          const isCompleted: boolean = cursus.projects[project.id] !== undefined

          return (
            <div key={project.id} className="flex items-center text-sm">
              {isCompleted ? (
                <CircleCheck className="mr-2 h-4 w-4 text-primary" />
              ) : (
                <CircleDashed className="mr-2 h-4 w-4" />
              )}

              <div>
                <p className="ml-1 truncate">{project.name}</p>

                <div className="space-x-2">
                  <Badge className="rounded-lg" variant="secondary">
                    {project.experience?.toLocaleString() ?? 0} XP
                  </Badge>

                  {isCompleted && (
                    <Badge className="rounded-lg">
                      {cursus.projects[project.id].mark}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}

function TitleOption({ option }: { option: FortyTwoTitleOption }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle tag="h3" className="truncate text-xl">
          {option.title}
        </CardTitle>
        <TitleOptionRequirements option={option} />
      </CardHeader>
      <CardContent className="p-0 md:p-6 md:pt-0">
        <ProjectList projects={option.projects} />
      </CardContent>
    </Card>
  )
}

export interface TitleOptionsProps {
  title: FortyTwoTitle
  className?: string
}

export function TitleOptions({ title, className }: TitleOptionsProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {title.options.map((option) => (
        <TitleOption key={option.title} option={option} />
      ))}

      <TitleOption
        option={{
          title: 'Suite',
          experience: 0,
          numberOfProjects: title.numberOfSuite,
          projects: title.suite
        }}
      />
    </div>
  )
}
