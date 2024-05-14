'use client'

import { FortyTwoLevel } from '@/types/forty-two'

export function calculateExperience(
  experience: number,
  grade: number,
  bonus: boolean
): number {
  const bonusMultiplier = bonus ? 1.042 : 1
  const gradeMultiplier = grade / 100

  return experience * gradeMultiplier * bonusMultiplier
}

export function getExperience(
  level: number,
  levels: Record<number, FortyTwoLevel>
): number {
  const integerLevel = Math.floor(level)
  const decimalLevel = level - integerLevel

  const currentLevel = levels[integerLevel]
  const nextLevel = levels[integerLevel + 1]

  if (currentLevel == undefined || nextLevel == undefined) {
    return 0
  }

  return (
    currentLevel.experience +
    (nextLevel.experience - currentLevel.experience) * decimalLevel
  )
}

export function getLevel(
  experience: number,
  levels: Record<number, FortyTwoLevel>
): number {
  let level = 0
  let nextLevelExperience = 0

  for (const [key, value] of Object.entries(levels)) {
    if (experience < value.experience) {
      nextLevelExperience = value.experience
      break
    }
    level = Number(key)
  }

  const currentLevel = levels[level]
  if (currentLevel == undefined) {
    return 0
  }

  const currentLevelExp = currentLevel.experience
  const decimalLevel =
    (experience - currentLevelExp) / (nextLevelExperience - currentLevelExp)

  return level + decimalLevel
}
