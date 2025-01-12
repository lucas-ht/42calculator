"use server";

import { loadLocalData } from "@/lib/storage/local-storage";
import {
  FortyTwoCursusId,
  type FortyTwoProject,
  type FortyTwoTitle,
  type FortyTwoTitleOption,
} from "@/types/forty-two";
import { getFortyTwoProjects } from "./forty-two-projects";

let FortyTwoTitles: FortyTwoTitle[] | null = null;

export async function getFortyTwoTitles(): Promise<FortyTwoTitle[]> {
  "use cache";

  if (FortyTwoTitles === null) {
    try {
      const data = await loadLocalData(`rncp_${FortyTwoCursusId.MAIN}`);

      FortyTwoTitles = await parseTitles(data);
    } catch (error) {
      process.stderr.write(`Error loading rncp: ${error}\n`);
    }
  }

  return FortyTwoTitles ?? [];
}

async function parseProjects(
  // biome-ignore lint: The any type is used here because the return type is JSON
  projectsData: any,
): Promise<Record<number, FortyTwoProject>> {
  const fortyTwoProjects = await getFortyTwoProjects();
  const projects: Record<number, FortyTwoProject> = {};

  for (const projectId of projectsData) {
    const project = fortyTwoProjects[projectId];
    if (project === undefined) {
      continue;
    }

    projects[projectId] = {
      id: project.id,
      name: project.name,
      experience: project.experience,
    };
  }

  return projects;
}

// biome-ignore lint: The any type is used here because the return type is JSON
async function parseOptions(optionsData: any): Promise<FortyTwoTitleOption[]> {
  const options: FortyTwoTitleOption[] = [];

  for (const option of optionsData) {
    options.push({
      title: option.title,
      experience: option.experience,
      numberOfProjects: option.number_of_projects,

      projects: await parseProjects(option.projects),
    });
  }

  return options;
}

// biome-ignore lint: The any type is used here because the return type is JSON
async function parseTitles(titlesData: any): Promise<FortyTwoTitle[]> {
  const titles: FortyTwoTitle[] = [];

  const suite = await parseProjects(titlesData.suite.projects);
  const experience = await parseProjects(titlesData.experience.projects);

  for (const title of titlesData.rncp) {
    titles.push({
      type: title.type,
      title: title.title,
      level: title.level,

      numberOfEvents: title.number_of_events,
      numberOfExperiences: title.number_of_experiences,
      numberOfSuite: title.number_of_suite,

      options: await parseOptions(title.options),

      suite,
      experience,
    });
  }

  return titles;
}
