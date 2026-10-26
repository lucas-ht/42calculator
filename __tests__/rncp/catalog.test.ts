import data from "../../data/rncp_21.json";
import rules from "../../data/rncp_rules_21.json";
import { projects, titles } from "./fixtures";

it("resolves every eligible, Suite and professional-experience project", () => {
  for (const title of titles) {
    for (const option of title.options) for (const project of Object.values(option.projects)) expect(project).toBeDefined();
    for (const id of data.experience.projects) expect(title.experience[id]).toBeDefined();
    for (const id of data.suite.projects) expect(title.suite[id]).toBeDefined();
  }
});
it("resolves every piscine module and its terminal project", () => {
  for (const rule of rules.piscines) {
    const project = projects[rule.id];
    expect(project.completionProjectId).toBe(rule.final_project_id);
    expect(project.children.map((child) => child.id)).toEqual(rule.project_ids);
    for (const id of rule.project_ids) expect(projects[id].parentId).toBe(rule.id);
  }
});
it("includes the newly documented RNCP 7 categories", () => {
  const network = titles[2];
  for (const id of [1431,1432,1438,1439,1440,1441,1442,1421,1422,1423,1456,2749]) expect(network.options[0].projects[id]).toBeDefined();
  for (const id of [2746,2750,2747]) expect(network.options[1].projects[id]).toBeDefined();
  expect(network.options[2].projects[2097]).toBeDefined();
  expect(titles[1].options[0].projects[2550]).toBeDefined();
  expect(titles[1].options[0].projects[2371]).toBeDefined();
  expect(titles[0].options[1].projects[2552]).toBeUndefined();
});
