import { BlobStorageService } from "@/lib/storage/blob-storage";
import { LocalStorageService } from "@/lib/storage/local-storage";
import { FortyTwoCursusId, type FortyTwoProject } from "@/types/forty-two";
import type { StorageService } from "@/types/storage";

export const runtime = "edge";

let FortyTwoProjects: Record<number, FortyTwoProject> | null = null;

const hasBlobToken = process.env.BLOB_READ_WRITE_TOKEN !== undefined;
const storageService: StorageService = hasBlobToken
  ? new BlobStorageService()
  : new LocalStorageService();

export async function getFortyTwoProjects(): Promise<
  Record<number, FortyTwoProject>
> {
  if (FortyTwoProjects === null) {
    try {
      const data = await storageService.load(
        `projects_${FortyTwoCursusId.MAIN}`,
      );

      FortyTwoProjects = parseProjects(data);
    } catch (error) {
      process.stderr.write(`Error loading projects: ${error}\n`);
    }
  }

  return FortyTwoProjects ?? {};
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
