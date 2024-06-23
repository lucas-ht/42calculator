import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { fortyTwoStore } from '@/providers/forty-two-store-provider'
import { FortyTwoProject, FortyTwoTitle } from '@/types/forty-two'

interface TitleRequirementProps {
  name: string
  value: number
  max: number
}

function TitleRequirement({ name, value, max }: TitleRequirementProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-1 text-sm">
        <p>{name}</p>
        <p className="font-medium">
          {value} / {max}
        </p>
      </div>
      <Progress
        max={max}
        value={value}
        aria-label={`${value} out of ${max} for the ${name.toLowerCase()}`}
      />
    </div>
  )
}

export interface TitleRequirementsProps {
  title: FortyTwoTitle
  className?: string
}

export function TitleRequirements({
  title,
  className
}: TitleRequirementsProps) {
  const { cursus } = fortyTwoStore.getState()

  const experiences: Array<FortyTwoProject> = []
  for (const project of Object.values(cursus.projects)) {
    const isExperience: boolean = title.experience[project.id] !== undefined
    if (isExperience) {
      experiences.push(project)
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle tag="h3" className="text-xl">
          Requirements
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 space-x-6">
        <TitleRequirement
          name={'Level required'}
          value={cursus.level}
          max={title.level}
        />
        <TitleRequirement
          name={'Number of events'}
          value={cursus.events}
          max={title.numberOfEvents}
        />
        <TitleRequirement
          name={'Number of experiences'}
          value={experiences.length}
          max={title.numberOfExperiences}
        />
      </CardContent>
    </Card>
  )
}
