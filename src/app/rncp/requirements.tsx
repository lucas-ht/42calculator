import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { FortyTwoTitle } from '@/types/forty-two'

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
          value={10}
          max={title.level}
        />
        <TitleRequirement
          name={'Number of events'}
          value={8}
          max={title.numberOfEvents}
        />
        <TitleRequirement
          name={'Number of experiences'}
          value={1}
          max={title.numberOfExperiences}
        />
      </CardContent>
    </Card>
  )
}
