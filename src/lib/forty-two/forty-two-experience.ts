"use server";

import { loadLocalData } from "@/lib/storage/local-storage";
import { FortyTwoCursusId, type FortyTwoLevel } from "@/types/forty-two";

// The experience data is static local JSON, so parse it once and reuse the
// result for the lifetime of the server process.
let cachedLevels: Record<number, FortyTwoLevel> | undefined;

export async function getFortyTwoLevels(): Promise<
  Record<number, FortyTwoLevel>
> {
  if (cachedLevels !== undefined) {
    return cachedLevels;
  }

  try {
    const experiences = await loadLocalData(
      `experience_${FortyTwoCursusId.MAIN}`,
    );

    cachedLevels = parseExperience(experiences);
    return cachedLevels;
  } catch (error) {
    process.stderr.write(`Error loading experience: ${error}\n`);
  }

  return {};
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
