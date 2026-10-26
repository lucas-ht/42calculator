import { createCalculatorStore, initCalculatorStore } from "@/stores/calculator-store";
import { usePlannedProjects } from "@/stores/planned-projects-store";
import { completed, projects } from "./fixtures";

const levels = { 0:{level:0,experience:0},1:{level:1,experience:10000},2:{level:2,experience:20000},3:{level:3,experience:40000} };
beforeEach(() => { usePlannedProjects.setState({planned:{}}); localStorage.clear(); });
it("keeps a child configuration nested in its parent plan and restores it", () => {
  const plan=usePlannedProjects.getState();plan.toggle(2199);
  plan.setConfig(2208,{mark:125,bonus:true},2199);
  const config=usePlannedProjects.getState().planned[2199];
  expect(config.children?.[2208]).toMatchObject({mark:125,bonus:true});
  expect(usePlannedProjects.getState().planned[2208]).toBeUndefined();
  const store=createCalculatorStore(initCalculatorStore(0,levels),levels);
  store.getState().addProject(projects[2199],config);
  const child=store.getState().entries[2199].children.find((c)=>c.project.id===2208)!;
  expect(child.project).toMatchObject({mark:125,bonus:true});
  expect(child.experience).toBe(3475*1.25*1.042);
});
it("does not re-award a completed module when restoring the remaining piscine", () => {
  const store=createCalculatorStore(initCalculatorStore(0.15,levels),levels);
  store.getState().addProject(projects[2199],{mark:100,bonus:false},{2202:completed(2202)});
  expect(store.getState().experience.end).toBe(9450);
  const earned=store.getState().entries[2199].children.find((c)=>c.project.id===2202)!;
  expect(earned.alreadyEarned).toBe(true);expect(earned.experience).toBe(0);
  store.getState().updateProject({...store.getState().entries[2199],project:{...projects[2199],mark:125,bonus:false}});
  expect(earned.experience).toBe(0);
});
