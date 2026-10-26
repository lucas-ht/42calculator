import type {
  FortyTwoProfile,
  ProjectUser,
} from "next-auth/providers/42-school";
import {
  type FortyTwoCursus,
  FortyTwoCursusId,
  type FortyTwoProject,
  type FortyTwoProjectStatus,
} from "@/types/forty-two";

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
  let count = 0;
  for (let page = 1; page <= 1000; page++) {
    const query = new URLSearchParams({
      "page[size]": "100",
      "page[number]": String(page),
    });
    const response = await fetch(
      `https://api.intra.42.fr/v2/users/${profile.id}/events?${query}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!response.ok) throw new Error("Failed to fetch events");
    const events: { kind: string }[] = await response.json();
    count += events.filter(
      (event) => event.kind !== "extern" && event.kind !== "association",
    ).length;
    if (events.length < 100) return count;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Event pagination exceeded its limit");
}

export function parseProjects(
  projectsData: ProjectUser[],
): Record<number, FortyTwoProject> {
  const projects: Record<number, FortyTwoProject> = {};

  for (const projectData of projectsData) {
    if (!projectData.cursus_ids.includes(FortyTwoCursusId.MAIN)) {
      continue;
    }

    const previous = projects[projectData.project.id];
    const markedAt = projectData.marked_at
      ? Date.parse(projectData.marked_at)
      : undefined;
    if (previous?.is_validated && !projectData["validated?"]) continue;
    if (
      previous?.is_validated === !!projectData["validated?"] &&
      (previous?.markedAt ?? 0) > (markedAt ?? 0)
    )
      continue;
    projects[projectData.project.id] = {
      id: projectData.project.id,
      name: projectData.project.name,

      experience: 0,
      children: [],

      completions: 0,
      duration: 0,

      parentId: projectData.project.parent_id ?? undefined,
      markedAt:
        markedAt !== undefined && Number.isFinite(markedAt)
          ? markedAt
          : undefined,
      createdAt: Date.parse(projectData.created_at as string),
      updatedAt: Date.parse(projectData.updated_at as string),

      status: projectData.status as FortyTwoProjectStatus,
      mark: projectData.final_mark as number,
      is_validated: projectData["validated?"] as boolean,
    };
  }

  return projects;
}
