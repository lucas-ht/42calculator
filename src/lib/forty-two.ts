import {
  FortyTwoCursus,
  FortyTwoCursusId,
  FortyTwoCursusProject
} from 'forty-two'

export const ParseCursus = (
  cursus_user: Array<any>,
  projects_users: Array<any>
): FortyTwoCursus => {
  const cursus: FortyTwoCursus = {
    id: FortyTwoCursusId.MAIN,
    level: 0,
    experience: undefined,
    projects: []
  }

  for (const cu of cursus_user) {
    if (cu.cursus_id === FortyTwoCursusId.MAIN) {
      cursus.level = cu.level
      break
    }
  }

  for (const pu of projects_users) {
    if (!pu.cursus_ids.includes(FortyTwoCursusId.MAIN)) {
      continue
    }

    cursus.projects.push({
      id: pu.project.id,
      final_mark: pu.final_mark
    } as FortyTwoCursusProject)
  }

  return cursus
}
