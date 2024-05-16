import { FortyTwoCursusId, FortyTwoLevel } from '@/types/forty-two'
import { list } from '@vercel/blob'
import { stderr } from 'process'

export const runtime = 'edge'

let FortyTwoLevels: Record<number, FortyTwoLevel> | null = null

export async function getFortyTwoLevels(): Promise<
  Record<number, FortyTwoLevel>
> {
  if (FortyTwoLevels === null) {
    try {
      await loadExperience()
    } catch (error) {
      stderr.write(`Error loading experience: ${error}`)
    }
  }

  return FortyTwoLevels ?? {}
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

  const response = await fetch(blobs[0].url)
  if (response.ok == false) {
    throw new Error('Failed to load experience data')
  }

  const jsonData = await response.json()

  FortyTwoLevels = parseExperience(jsonData)
}
