'use client'

import { ExpandedFortyTwoProject } from '@/types/forty-two'
import { ColumnDef } from '@tanstack/react-table'
import {
  AddProject,
  ProjectBonus,
  ProjectGrade,
  RemoveProject
} from './actions'

export const columns: ColumnDef<ExpandedFortyTwoProject>[] = [
  {
    id: 'remove',
    header: () => {
      return (
        <>
          <AddProject />
        </>
      )
    },
    enableHiding: false,
    cell: ({ row }) => {
      const project = row.original
      return (
        <>
          <RemoveProject project={project} />
        </>
      )
    },
    meta: {
      className: 'w-14 px-2'
    }
  },
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    enableHiding: false
  },
  {
    id: 'mark',
    header: 'Mark',
    enableHiding: false,
    cell: ({ row }) => {
      const project = row.original
      return (
        <>
          <ProjectGrade project={project} />
        </>
      )
    },
    meta: {
      className: 'min-w-[52px]'
    }
  },
  {
    id: 'bonus',
    header: 'Coalition Bonus',
    enableHiding: false,
    cell: ({ row }) => {
      const project = row.original
      return (
        <>
          <ProjectBonus project={project} />
        </>
      )
    }
  },
  {
    id: 'base experience',
    header: 'Base Experience',
    cell: ({ row }) => {
      const project = row.original
      return <>{project.experience.base.toFixed(0)}</>
    },
    meta: {
      visible: false
    }
  },
  {
    id: 'gained experience',
    header: 'Gained Experience',
    cell: ({ row }) => {
      const project = row.original
      return <>{project.experience.gained.toFixed(0)}</>
    },
    meta: {
      visible: false
    }
  },
  {
    id: 'level',
    header: 'Level',
    cell: ({ row }) => {
      const project = row.original
      return <>{project.level.toFixed(2)}</>
    },
    meta: {
      className: 'w-max-[40px] text-right'
    }
  }
]
