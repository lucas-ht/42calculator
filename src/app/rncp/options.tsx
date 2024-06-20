import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  FortyTwoProject,
  FortyTwoTitle,
  FortyTwoTitleOption
} from '@/types/forty-two'
import { CircleCheckBig, CircleDashed } from 'lucide-react'

function ProjectList({ projects }: { projects: Array<FortyTwoProject> }) {
  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2">
        {projects.map((project) => (
          <div key={project.id} className="flex items-center text-sm">
            {true ? (
              <CircleDashed className="mr-2 h-4 w-4" />
            ) : (
              <CircleCheckBig className="mr-2 h-4 w-4" />
            )}

            <div>
              <p className="ml-1 truncate">{project.name}</p>

              <Badge className="rounded-lg" variant="secondary">
                {project.experience.toLocaleString()} XP
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

function TitleOption({ option }: { option: FortyTwoTitleOption }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle tag="h3" className="text-xl">
          {option.title}
        </CardTitle>
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
        'grid grid-cols-1 space-x-4 md:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {title.options.map((option) => (
        <TitleOption key={option.title} option={option} />
      ))}
    </div>
  )
}
