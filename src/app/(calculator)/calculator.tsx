import { auth } from '@/auth'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { getFortyTwoProjects } from '@/lib/forty-two-projects'
import CalculatorTable from './calculator-table'

export async function Calculator() {
  const session = await auth()
  const level = session?.user?.cursus?.level ?? 0

  const projects_data = await getFortyTwoProjects()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Calculator</CardTitle>
        <CardDescription>
          Calculate your level based on your future 42 projects.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CalculatorTable
          projects_data={Object.values(projects_data)}
          level={level}
        />
      </CardContent>
    </Card>
  )
}

export default Calculator
