import { BlobStorageService } from "@/lib/storage/blob-storage";
import { LocalStorageService } from "@/lib/storage/local-storage";
import { FortyTwoCursusId, type FortyTwoLevel } from "@/types/forty-two";
import type { StorageService } from "@/types/storage";

export const runtime = "edge";

let FortyTwoLevels: Record<number, FortyTwoLevel> | null = null;

const hasBlobToken = process.env.BLOB_READ_WRITE_TOKEN !== undefined;
const storageService: StorageService = hasBlobToken
  ? new BlobStorageService()
  : new LocalStorageService();

export async function getFortyTwoLevels(): Promise<
  Record<number, FortyTwoLevel>
> {
  if (FortyTwoLevels === null) {
    try {
      const data = await storageService.load(
        `experience_${FortyTwoCursusId.MAIN}`,
      );

      FortyTwoLevels = parseExperience(data);
    } catch (error) {
      process.stderr.write(`Error loading experience: ${error}\n`);
    }
  }

  return FortyTwoLevels ?? {};
}

// biome-ignore lint: The any type is used here because the return type is JSON
function parseExperience(experience: any): Record<number, FortyTwoLevel> {
  const levels: Record<number, FortyTwoLevel> = {};

  for (const level of experience.levels) {
    levels[level.level] = {
      level: level.level,
      experience: level.experience,
    };
  }

  return levels;
}
