'use server'

import { FortyTwoCursusId, FortyTwoProject } from '@/types/forty-two'
import fs from 'fs'
import path from 'path'

let FortyTwoProjects: Record<number, FortyTwoProject> = {}

export async function getFortyTwoProjects(): Promise<
  Record<number, FortyTwoProject>
> {
  return FortyTwoProjects
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function parseProjects(projects_data: any): Record<number, FortyTwoProject> {
  const projects: Record<number, FortyTwoProject> = {}

  for (const project of projects_data.projects) {
    projects[project.id] = {
      id: project.id,
      name: project.name,
      experience: project.experience
    }
  }

  return projects
}

function loadProjects() {
  const filePath = path.join(
    process.cwd(),
    'src',
    'data',
    `projects_${FortyTwoCursusId.MAIN}.json`
  )
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const jsonData = JSON.parse(fileContent)

  FortyTwoProjects = parseProjects(jsonData)
}

loadProjects()
