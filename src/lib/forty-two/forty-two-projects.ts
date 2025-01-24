"use server";

import { loadLocalData } from "@/lib/storage/local-storage";
import { FortyTwoCursusId, type FortyTwoProject } from "@/types/forty-two";

export async function getFortyTwoProjects(): Promise<
  Record<number, FortyTwoProject>
> {
  "use cache";

  try {
    const projects = await loadLocalData(`projects_${FortyTwoCursusId.MAIN}`);

    return parseProjects(projects);
  } catch (error) {
    process.stderr.write(`Error loading projects: ${error}\n`);
  }

  return {};
}

// biome-ignore lint: The any type is used here because the return type is JSON
function parseProjects(projectsData: any): Record<number, FortyTwoProject> {
  const projects: Record<number, FortyTwoProject> = {};

  for (const project of projectsData.projects) {
    projects[project.id] = {
      id: project.id,
      name: project.name,
      experience: project.difficulty,
    };
  }

  return projects;
}
