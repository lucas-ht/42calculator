'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { TableCell, TableRow } from '@/components/ui/table'
import { useCalculatorStore } from '@/providers/calculator-store-provider'
import { FortyTwoProject } from '@/types/forty-two'
import { Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import { z } from 'zod'

function RemoveProject({ project }: { project: FortyTwoProject }) {
  const { removeProject } = useCalculatorStore((state) => state)

  return (
    <Button
      variant="ghost"
      size="icon"
      className="group"
      onClick={() => {
        removeProject(project.id)
      }}
    >
      <Trash2 className="h-4 w-4 transition-colors group-hover:stroke-destructive" />
    </Button>
  )
}

function ProjectGrade({ project }: { project: FortyTwoProject }) {
  const [inputValue, setInputValue] = useState<number | null>(
    project.final_mark ?? null
  )
  const { updateProject } = useCalculatorStore((state) => state)
  const gradeSchema = z.number().min(0).max(125)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === '') {
      setInputValue(null)
      updateProject({ ...project, final_mark: 0 })
      return
    }

    const newValue = Number(event.target.value)
    if (gradeSchema.safeParse(newValue).success) {
      setInputValue(newValue)
      updateProject({ ...project, final_mark: newValue })
    }
  }

  return (
    <Input
      value={inputValue ?? ''}
      onChange={handleInputChange}
      placeholder="100"
      className="max-w-[100px]"
    />
  )
}

function ProjectBonus({ project }: { project: FortyTwoProject }) {
  const { updateProject } = useCalculatorStore((state) => state)

  return (
    <Switch
      checked={project.bonus_coalition}
      onCheckedChange={(checked) => {
        updateProject({ ...project, bonus_coalition: checked })
      }}
    />
  )
}

export function Project({ project }: { project: FortyTwoProject }) {
  return (
    <TableRow>
      <TableCell>
        <RemoveProject project={project} />
      </TableCell>

      <TableCell className="overflow-hidden text-ellipsis font-medium">
        {project.name}
      </TableCell>

      <TableCell>
        <ProjectGrade project={project} />
      </TableCell>

      <TableCell>
        <ProjectBonus project={project} />
      </TableCell>
    </TableRow>
  )
}
