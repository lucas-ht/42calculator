import { BlobStorageService } from '@/lib/storage/blob-storage'
import { LocalStorageService } from '@/lib/storage/local-storage'
import { FortyTwoCursusId, FortyTwoProject } from '@/types/forty-two'
import { StorageService } from '@/types/storage'
import { stderr } from 'process'

export const runtime = 'edge'

let FortyTwoProjects: Record<number, FortyTwoProject> | null = null

const hasBlobToken = process.env.BLOB_READ_WRITE_TOKEN != undefined
const storageService: StorageService = hasBlobToken
  ? new BlobStorageService()
  : new LocalStorageService()

export async function getFortyTwoProjects(): Promise<
  Record<number, FortyTwoProject>
> {
  if (FortyTwoProjects === null) {
    try {
      const data = await storageService.load(
        `projects_${FortyTwoCursusId.MAIN}`
      )

      FortyTwoProjects = parseProjects(data)
    } catch (error) {
      stderr.write(`Error loading projects: ${error}\n`)
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
