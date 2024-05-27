import { auth } from '@/auth'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { getFortyTwoLevels } from '@/lib/forty-two/forty-two-experience'
import { getFortyTwoProjects } from '@/lib/forty-two/forty-two-projects'
import { CalculatorStoreProvider } from '@/providers/calculator-store-provider'
import CalculatorTable from './(table)/table'

export async function Calculator() {
  const session = await auth()
  const level = session?.user?.cursus?.level ?? 0

  const projects = await getFortyTwoProjects()
  const levels = await getFortyTwoLevels()

  return (
    <Card className="w-full bg-card/5 backdrop-blur">
      <CardHeader>
        <CardTitle tag="h1">Calculator</CardTitle>
        <CardDescription>
          Calculate your level based on your future 42 projects.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 md:p-6">
        <CalculatorStoreProvider
          level={level}
          levels={levels}
          projects={projects}
        >
          <CalculatorTable />
        </CalculatorStoreProvider>
      </CardContent>
    </Card>
  )
}

export default Calculator
