import { auth } from '@/auth'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { getFortyTwoLevels } from '@/lib/forty-two-experience'
import { getFortyTwoProjects } from '@/lib/forty-two-projects'
import { CalculatorStoreProvider } from '@/providers/calculator-store-provider'
import CalculatorTable from './calculator-table'

export async function Calculator() {
  const session = await auth()
  const level = session?.user?.cursus?.level ?? 0

  const projects = await getFortyTwoProjects()
  const levels = await getFortyTwoLevels()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Calculator</CardTitle>
        <CardDescription>
          Calculate your level based on your future 42 projects.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CalculatorStoreProvider level={level} levels={levels}>
          <CalculatorTable projects_data={Object.values(projects)} />
        </CalculatorStoreProvider>
      </CardContent>
    </Card>
  )
}

export default Calculator
