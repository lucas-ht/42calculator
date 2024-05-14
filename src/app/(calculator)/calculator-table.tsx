'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useCalculatorStore } from '@/stores/calculator'
import { FortyTwoProject } from '@/types/forty-two'
import { useEffect } from 'react'
import { AddProject } from './add-project'
import { Project } from './project'

export function CalculatorTable({
  level,
  projects_data
}: {
  level: number
  projects_data: Array<FortyTwoProject>
}) {
  const { projects, level: predictedLevel, setLevel } = useCalculatorStore()

  useEffect(() => {
    setLevel(level)
  })

  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead className="w-16 px-2 text-center">
            <AddProject projects={projects_data} />
          </TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Grade</TableHead>
          <TableHead>Coalition Bonus</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.values(projects).map((project) => (
          <Project key={project.id} project={project} />
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Level</TableCell>
          <TableCell className="text-right font-medium">
            {predictedLevel.toFixed(2)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}

export default CalculatorTable
