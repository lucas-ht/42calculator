import { FortyTwoCursusId, FortyTwoProject } from '@/types/forty-two'
import { list } from '@vercel/blob'

export const runtime = 'edge'

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

async function loadProjects() {
  const { blobs } = await list({
    prefix: `projects_${FortyTwoCursusId.MAIN}`
  })

  const fileContent = await fetch(blobs[0].url)
  const jsonData = await fileContent.json()

  FortyTwoProjects = parseProjects(jsonData)
}

loadProjects()
