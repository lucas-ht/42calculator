import { auth } from '@/auth'
import { getFortyTwoProjects } from '@/lib/forty-two-projects'
import CalculatorTable from './calculator-table'

export async function Calculator() {
  const session = await auth()
  const level = session?.user?.cursus?.level ?? 0

  const projects_data = await getFortyTwoProjects()

  return (
    <CalculatorTable
      projects_data={Object.values(projects_data)}
      level={level}
    />
  )
}

export default Calculator
