import {
  FortyTwoCursus,
  FortyTwoCursusId,
  FortyTwoProject
} from '@/types/forty-two'
import { FortyTwoProfile, ProjectUser } from 'next-auth/providers/42-school'

async function getEvents(
  profile: FortyTwoProfile,
  access_token: string
): Promise<number> {
  const response = await fetch(
    `https://api.intra.42.fr/v2/users/${profile.id}/events`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch events')
  }

  const events = await response.json()

  return events.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any) => event.kind !== 'extern' && event.kind !== 'association'
  ).length
}

function parseProjects(
  projects_data: Array<ProjectUser>
): Record<number, FortyTwoProject> {
  const projects: Record<number, FortyTwoProject> = {}

  for (const project_data of projects_data) {
    if (project_data.status !== 'finished') {
      continue
    }
    if (project_data.cursus_ids[0] !== FortyTwoCursusId.MAIN) {
      continue
    }

    projects[project_data.project.id] = {
      id: project_data.project.id,
      name: project_data.project.name,

      finishedAt: Date.parse(project_data.marked_at as string),
      mark: project_data.final_mark as number
    }
  }

  return projects
}

export async function parseCursus(
  profile: FortyTwoProfile,
  accessToken: string
): Promise<FortyTwoCursus | null> {
  for (const cursus of profile.cursus_users) {
    if (cursus.cursus_id !== FortyTwoCursusId.MAIN) {
      continue
    }

    return {
      id: cursus.cursus_id,
      name: cursus.cursus.name,
      slug: cursus.cursus.slug,

      level: cursus.level,

      events: await getEvents(profile, accessToken),
      projects: parseProjects(profile.projects_users)
    }
  }

  return null
}
