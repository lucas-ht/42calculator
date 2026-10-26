"use server";

import { buildProjectIndex } from "@/lib/rncp/catalog";
import { loadLocalData } from "@/lib/storage/local-storage";
import { FortyTwoCursusId, type FortyTwoProject } from "@/types/forty-two";

// The project data is static local JSON, so parse it once and reuse the
// result for the lifetime of the server process.
let cachedProjects: Record<number, FortyTwoProject> | undefined;

export async function getFortyTwoProjects(): Promise<
  Record<number, FortyTwoProject>
> {
  if (cachedProjects !== undefined) {
    return cachedProjects;
  }

  try {
    const projects = await loadLocalData(`projects_${FortyTwoCursusId.MAIN}`);

    cachedProjects = buildProjectIndex(projects.projects);
    return cachedProjects;
  } catch (error) {
    process.stderr.write(`Error loading projects: ${error}\n`);
  }

  return {};
}
