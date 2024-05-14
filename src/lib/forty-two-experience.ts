'use server'

import { FortyTwoCursusId, FortyTwoLevel } from '@/types/forty-two'
import { list } from '@vercel/blob'

let FortyTwoLevels: Record<number, FortyTwoLevel> = {}

export async function getFortyTwoLevels(): Promise<
  Record<number, FortyTwoLevel>
> {
  return FortyTwoLevels
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function parseExperience(experience: any): Record<number, FortyTwoLevel> {
  const levels: Record<number, FortyTwoLevel> = {}

  for (const level of experience.levels) {
    levels[level.level] = {
      level: level.level,
      experience: level.experience
    }
  }

  return levels
}

async function loadExperience() {
  const { blobs } = await list({
    prefix: `experience_${FortyTwoCursusId.MAIN}`
  })

  const fileContent = await fetch(blobs[0].url)
  const jsonData = await fileContent.json()

  FortyTwoLevels = parseExperience(jsonData)
}

loadExperience()
