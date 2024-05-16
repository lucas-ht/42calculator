import { FortyTwoCursusId, FortyTwoProject } from '@/types/forty-two'
import { list } from '@vercel/blob'
import { stderr } from 'process'

export const runtime = 'edge'

let FortyTwoProjects: Record<number, FortyTwoProject> | null = null

export async function getFortyTwoProjects(): Promise<
  Record<number, FortyTwoProject>
> {
  if (FortyTwoProjects === null) {
    try {
      await loadProjects()
    } catch (error) {
      stderr.write(`Error loading projects: ${error}`)
    }
  }

  return FortyTwoProjects ?? {}
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

async function loadProjects() {
  const { blobs } = await list({
    prefix: `projects_${FortyTwoCursusId.MAIN}`
  })

  const response = await fetch(blobs[0].url)
  if (response.ok == false) {
    throw new Error('Failed to load experience data')
  }

  const jsonData = await response.json()

  FortyTwoProjects = parseProjects(jsonData)
}
