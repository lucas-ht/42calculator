import { FortyTwoCursus, FortyTwoCursusId } from '@/types/forty-two'

/* eslint-disable @typescript-eslint/no-explicit-any */
export const parseCursus = (profile: any): undefined | FortyTwoCursus => {
  for (const cursus of profile.cursus_users) {
    if (cursus.cursus_id !== FortyTwoCursusId.MAIN) {
      continue
    }

    return {
      id: cursus.cursus_id,
      name: cursus.cursus.name,
      slug: cursus.cursus.slug,
      level: cursus.level,
      experience: 0,
      projects: []
    }
  }

  return undefined
}
