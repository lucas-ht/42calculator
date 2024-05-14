'use client'

import {
  Table,
  TableBody,
  TableCaption,
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
  }, [setLevel, level])

  return (
    <Table>
      <TableCaption>
        Calculate your level based on your future 42 projects.
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/4">
            <AddProject projects={projects_data} />
          </TableHead>
          <TableHead className="w-1/4">Project</TableHead>
          <TableHead className="w-1/4">Grade</TableHead>
          <TableHead className="w-1/4">Coalition Bonus</TableHead>
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
          <TableCell className="text-right">
            {predictedLevel.toFixed(2)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}

export default CalculatorTable
