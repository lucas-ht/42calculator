import {
  type FortyTwoCursus,
  FortyTwoCursusId,
  type FortyTwoProject,
} from "@/types/forty-two";
import type {
  FortyTwoProfile,
  ProjectUser,
} from "next-auth/providers/42-school";

export async function parseCursus(
  profile: FortyTwoProfile,
  accessToken: string,
): Promise<FortyTwoCursus | null> {
  for (const cursus of profile.cursus_users) {
    if (cursus.cursus_id !== FortyTwoCursusId.MAIN) {
      continue;
    }

    return {
      id: cursus.cursus_id,
      name: cursus.cursus.name,
      slug: cursus.cursus.slug,

      level: cursus.level,

      events: await getEvents(profile, accessToken),
      projects: parseProjects(profile.projects_users),
    };
  }

  return null;
}

async function getEvents(
  profile: FortyTwoProfile,
  accessToken: string,
): Promise<number> {
  const response = await fetch(
    `https://api.intra.42.fr/v2/users/${profile.id}/events`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }

  const events = await response.json();

  return events.filter(
    // biome-ignore lint: The any type is used here because the return type is JSON
    (event: any) => event.kind !== "extern" && event.kind !== "association",
  ).length;
}

function parseProjects(
  projectsData: ProjectUser[],
): Record<number, FortyTwoProject> {
  const projects: Record<number, FortyTwoProject> = {};

  for (const projectData of projectsData) {
    if (projectData.status !== "finished") {
      continue;
    }
    if (projectData.cursus_ids[0] !== FortyTwoCursusId.MAIN) {
      continue;
    }

    projects[projectData.project.id] = {
      id: projectData.project.id,
      name: projectData.project.name,

      finishedAt: Date.parse(projectData.marked_at as string),
      mark: projectData.final_mark as number,
    };
  }

  return projects;
}
