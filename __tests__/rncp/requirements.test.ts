import { getGeneralProgress } from "@/lib/rncp/general-progress";
import { getTitleProgress } from "@/lib/rncp/title-progress";
import { completed, emptyCursus, projects, titles } from "./fixtures";

const coreDate = Date.UTC(2026, 0, 1);
const title = titles[2];
it("counts group projects only when validated after common core", () => {
  const cursus = { ...emptyCursus, projects: {
    1337: completed(1337, coreDate),
    1401: completed(1401, coreDate - 1),
    1414: completed(1414, coreDate + 1),
    2064: completed(2064, coreDate + 2),
    1396: completed(1396, coreDate + 3),
  } };
  expect(getGeneralProgress(title, cursus, {})).toMatchObject({ coreComplete: true, groupProjects: 2 });
  expect(getGeneralProgress(title, { ...cursus, projects: { 1414: completed(1414) } }, {})).toMatchObject({ coreComplete: false, groupProjects: 0 });
});
it("counts validated apprenticeship terminal projects and excludes unfinished ones", () => {
  const cursus = { ...emptyCursus, projects: { 1864: completed(1864), 1880: completed(1880), 1872: { ...completed(1872), is_validated: false } } };
  expect(getGeneralProgress(title, cursus, {}).experiences.map((p) => p.id).sort()).toEqual([1864, 1880]);
});
it("counts newer full-time apprenticeship projects", () => {
  const cursus = { ...emptyCursus, projects: { 2340: completed(2340), 2341: completed(2341) } };
  expect(getGeneralProgress(title, cursus, {}).experiences).toHaveLength(2);
});
it("requires all categories, Suite and every general requirement", () => {
  const option = (id: number) => ({ title: String(id), projects: { [id]: projects[id] }, experience: 1, numberOfProjects: 1 });
  const testTitle = { ...title, options: [option(1414), option(1401)], suite: { 2064: projects[2064] } };
  const cursus = { ...emptyCursus, projects: Object.fromEntries([1337,1414,1401,2064,1638,1644].map((id) => [id, completed(id, id===1337 ? coreDate : coreDate+1)])) };
  const check = (value = cursus) => getTitleProgress(testTitle, value, {}, projects, {});
  expect(check().isComplete).toBe(true);
  for (const id of [1337,1414,1401,2064,1638]) {
    const next = { ...cursus, projects: { ...cursus.projects } }; delete next.projects[id];
    expect(check(next).isComplete).toBe(false);
  }
  expect(check({ ...cursus, events: 14 }).isComplete).toBe(false);
  expect(check({ ...cursus, level: 20 }).isComplete).toBe(false);
});
