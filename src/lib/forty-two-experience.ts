'use server'

import { FortyTwoCursusId, FortyTwoLevel } from '@/types/forty-two'
import { list } from '@vercel/blob'

let FortyTwoLevels: Record<number, FortyTwoLevel> = {}

export async function calculateExperience(
  experience: number,
  grade: number,
  bonus: boolean
): Promise<number> {
  const bonusMultiplier = bonus ? 1.042 : 1
  const gradeMultiplier = grade / 100

  return experience * gradeMultiplier * bonusMultiplier
}

export async function getExperience(level: number): Promise<number> {
  const integerLevel = Math.floor(level)
  const decimalLevel = level - integerLevel

  const currentLevel = FortyTwoLevels[integerLevel]
  const nextLevel = FortyTwoLevels[integerLevel + 1]

  return (
    currentLevel.experience +
    (nextLevel.experience - currentLevel.experience) * decimalLevel
  )
}

export async function getLevel(experience: number): Promise<number> {
  let level = 0
  let nextLevelExperience = 0

  for (const [key, value] of Object.entries(FortyTwoLevels)) {
    if (experience < value.experience) {
      nextLevelExperience = value.experience
      break
    }
    level = Number(key)
  }

  const currentLevelExp = FortyTwoLevels[level].experience
  const decimalLevel =
    (experience - currentLevelExp) / (nextLevelExperience - currentLevelExp)

  return level + decimalLevel
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
