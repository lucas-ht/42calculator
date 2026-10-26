"use server";

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

    cachedProjects = parseProjects(projects);
    return cachedProjects;
  } catch (error) {
    process.stderr.write(`Error loading projects: ${error}\n`);
  }

  return {};
}

// biome-ignore lint: The any type is used here because the return type is JSON
function parseProject(projectData: any): FortyTwoProject {
  const project: FortyTwoProject = {
    id: projectData.id,
    name: projectData.name,

    experience: projectData.difficulty,

    parentId: projectData.parent?.id,
    children: [],

    completions: projectData.completions,
    duration: projectData.duration,
  };

  if (projectData.children != null) {
    project.children = projectData.children.map(parseProject);
  }

  return project;
}

// biome-ignore lint: The any type is used here because the return type is JSON
function parseProjects(projectsData: any): Record<number, FortyTwoProject> {
  const projects: Record<number, FortyTwoProject> = {};

  for (const projectData of projectsData.projects) {
    if (projectData.exam === true) {
      continue;
    }

    const project = parseProject(projectData);
    projects[project.id] = project;
  }

  // This is necessary because the children does not contains the full project by default
  for (const project of Object.values(projects)) {
    if (project.children.length === 0) {
      continue;
    }

    const children: FortyTwoProject[] = [];
    for (const child of project.children) {
      children.push(projects[child.id]);
      delete projects[child.id];
    }

    project.children = children;
  }

  return projects;
}
