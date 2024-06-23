import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { fortyTwoStore } from '@/providers/forty-two-store-provider'
import {
  FortyTwoProject,
  FortyTwoTitle,
  FortyTwoTitleOption
} from '@/types/forty-two'

interface TitleRequirementProps {
  name: string
  value: number
  max: number
  unit?: string
}

function TitleRequirement({ name, value, max, unit }: TitleRequirementProps) {
  function formatValue(value: number) {
    if (value > 1000) {
      return `${(value / 1000).toFixed(1).toLocaleString()}K`
    }
    return value.toLocaleString()
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-1 text-sm">
        <p>{name}</p>
        <p className="font-medium">
          {formatValue(value)} / {formatValue(max)} {unit}
        </p>
      </div>
      <Progress
        max={max}
        value={value > max ? max : value}
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

export interface TitleOptionRequirementsProps {
  option: FortyTwoTitleOption
}

export function TitleOptionRequirements({
  option
}: TitleOptionRequirementsProps) {
  const { cursus } = fortyTwoStore.getState()

  let projects: number = 0
  let experience: number = 0

  for (const project of Object.values(option.projects)) {
    const cursusProject: FortyTwoProject | undefined =
      cursus.projects[project.id]
    if (cursusProject) {
      projects++
      experience +=
        (project.experience || 0) * ((cursusProject.mark || 0) / 100)
    }
  }

  return (
    <div className="space-y-4">
      <TitleRequirement
        name={'Projects'}
        value={projects}
        max={option.numberOfProjects}
      />

      {option.experience > 0 && (
        <TitleRequirement
          name={'Experience'}
          value={experience}
          max={option.experience}
          unit="XP"
        />
      )}
    </div>
  )
}
