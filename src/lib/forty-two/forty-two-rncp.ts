import { BlobStorageService } from '@/lib/storage/blob-storage'
import { LocalStorageService } from '@/lib/storage/local-storage'
import {
  FortyTwoCursusId,
  FortyTwoProject,
  FortyTwoTitle,
  FortyTwoTitleOption
} from '@/types/forty-two'
import { StorageService } from '@/types/storage'
import { getFortyTwoProjects } from './forty-two-projects'

export const runtime = 'edge'

let FortyTwoTitles: Array<FortyTwoTitle> | null = null

const hasBlobToken = process.env.BLOB_READ_WRITE_TOKEN != undefined
const storageService: StorageService = hasBlobToken
  ? new BlobStorageService()
  : new LocalStorageService()

export async function getFortyTwoTitles(): Promise<Array<FortyTwoTitle>> {
  if (FortyTwoTitles === null) {
    try {
      const data = await storageService.load(`rncp_${FortyTwoCursusId.MAIN}`)

      FortyTwoTitles = await parseTitles(data)
    } catch (error) {
      process.stderr.write(`Error loading rncp: ${error}\n`)
    }
  }

  return FortyTwoTitles ?? []
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function parseProjects(
  projects_data: any
): Promise<Array<FortyTwoProject>> {
  const fortyTwoProjects = await getFortyTwoProjects()
  const projects: Array<FortyTwoProject> = []

  for (const project_id of projects_data) {
    const project = fortyTwoProjects[project_id]
    if (project === undefined) {
      continue
    }

    projects.push({
      id: project.id,
      name: project.name,
      experience: project.experience
    })
  }

  return projects
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function parseOptions(
  options_data: any
): Promise<Array<FortyTwoTitleOption>> {
  const options: Array<FortyTwoTitleOption> = []

  for (const option of options_data) {
    options.push({
      title: option.title,
      experience: option.experience,
      numberOfProjects: option.numberOfProjects,

      projects: await parseProjects(option.projects)
    })
  }

  return options
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function parseTitles(titles_data: any): Promise<Array<FortyTwoTitle>> {
  const titles: Array<FortyTwoTitle> = []

  const suite = await parseProjects(titles_data.suite.projects)
  const experience = await parseProjects(titles_data.experience.projects)

  for (const title of titles_data.rncp) {
    titles.push({
      type: title.type,
      title: title.title,
      level: title.level,

      numberOfEvents: title.number_of_events,
      numberOfExperiences: title.number_of_experiences,
      numberOfSuite: title.number_of_suite,

      options: await parseOptions(title.options),

      suite,
      experience
    })
  }

  return titles
}
