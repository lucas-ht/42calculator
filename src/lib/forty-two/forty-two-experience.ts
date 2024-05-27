import { BlobStorageService } from '@/lib/storage/blob-storage'
import { LocalStorageService } from '@/lib/storage/local-storage'
import { FortyTwoCursusId, FortyTwoLevel } from '@/types/forty-two'
import { StorageService } from '@/types/storage'
import { stderr } from 'process'

export const runtime = 'edge'

let FortyTwoLevels: Record<number, FortyTwoLevel> | null = null

const hasBlobToken = process.env.BLOB_READ_WRITE_TOKEN != undefined
const storageService: StorageService = hasBlobToken
  ? new BlobStorageService()
  : new LocalStorageService()

export async function getFortyTwoLevels(): Promise<
  Record<number, FortyTwoLevel>
> {
  if (FortyTwoLevels === null) {
    try {
      console.log(`fetching experience_${FortyTwoCursusId.MAIN}`)
      const data = await storageService.load(
        `experience_${FortyTwoCursusId.MAIN}`
      )
      FortyTwoLevels = parseExperience(data)
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
