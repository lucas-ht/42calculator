import projectData from "../../data/projects_21.json";
import titleData from "../../data/rncp_21.json";
import { buildProjectIndex } from "@/lib/rncp/catalog";
import type { FortyTwoCursus, FortyTwoTitle } from "@/types/forty-two";

export const projects = buildProjectIndex(projectData.projects);
export const emptyCursus: FortyTwoCursus = { id: 21, name: "Test", slug: "test", level: 21, events: 15, projects: {} };
export function completed(id: number, markedAt = Date.UTC(2026, 1, 1), mark = 100) {
  return { ...projects[id], is_validated: true, mark, markedAt };
}
export const titles: FortyTwoTitle[] = titleData.rncp.map((title) => {
  const index = (ids: number[]) => Object.fromEntries(ids.map((id) => [id, projects[id]]));
  return { type: title.type, title: title.title, level: title.level, numberOfEvents: title.number_of_events,
    numberOfExperiences: title.number_of_experiences, numberOfSuite: title.number_of_suite,
    options: title.options.map((option) => ({ title: option.title, experience: option.experience, numberOfProjects: option.number_of_projects, projects: index(option.projects) })),
    suite: index(titleData.suite.projects), experience: index(titleData.experience.projects) };
});
