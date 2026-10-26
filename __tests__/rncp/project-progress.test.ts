import { getOptionProgress, getPlannedExperience, getProjectProgress } from "@/lib/rncp/project-progress";
import { completed, emptyCursus, projects } from "./fixtures";

const piscine = projects[2199];
const plan = { 2199: { mark: 100, bonus: false } };

describe("RNCP piscine contributions", () => {
  it("earns module XP before the final module, without earning a project", () => {
    const cursus = { ...emptyCursus, projects: { 2202: completed(2202) } };
    expect(getProjectProgress(piscine, cursus, {})).toEqual({ projects: 0, experience: 1500, simulatedProjects: 0, simulatedExperience: 0 });
  });
  it("counts the validated final module as exactly one project", () => {
    const cursus = { ...emptyCursus, projects: { 2208: completed(2208) } };
    expect(getProjectProgress(piscine, cursus, {})).toMatchObject({ projects: 1, experience: 3475 });
  });
  it("sums all validated modules without counting them as separate projects", () => {
    const cursus = { ...emptyCursus, projects: Object.fromEntries(piscine.children.map((child) => [child.id, completed(child.id)])) };
    expect(getProjectProgress(piscine, cursus, {})).toMatchObject({ projects: 1, experience: 9450 });
  });
  it("simulates only the unearned XP and preserves child overrides", () => {
    const cursus = { ...emptyCursus, projects: { 2202: completed(2202) } };
    const planned = { 2199: { mark: 100, bonus: false, children: { 2208: { mark: 125, bonus: true } } } };
    const expected = 3475 + 1000 + 3475 * 1.25 * 1.042;
    expect(getProjectProgress(piscine, cursus, planned)).toMatchObject({ experience: 1500, simulatedProjects: 1, simulatedExperience: expected });
    expect(getPlannedExperience(cursus, planned, projects)).toBe(expected);
  });
  it("never doubles already validated XP when a persisted plan remains", () => {
    const cursus = { ...emptyCursus, projects: Object.fromEntries(piscine.children.map((child) => [child.id, completed(child.id)])) };
    expect(getProjectProgress(piscine, cursus, plan)).toMatchObject({ simulatedProjects: 0, simulatedExperience: 0 });
  });
  it("requires both project count and XP for a category", () => {
    const option = { title: "Test", experience: 10000, numberOfProjects: 2, projects: { 2199: piscine } };
    expect(getOptionProgress(option, emptyCursus, plan).isComplete).toBe(false);
  });
});
