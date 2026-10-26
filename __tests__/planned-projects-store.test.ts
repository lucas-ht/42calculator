import { usePlannedProjects } from "@/stores/planned-projects-store";

describe("planned-projects store", () => {
  beforeEach(() => {
    usePlannedProjects.setState({ planned: {} });
    window.localStorage.clear();
  });

  it("toggles a project on and off", () => {
    const { toggle } = usePlannedProjects.getState();

    toggle(1314);
    expect(usePlannedProjects.getState().planned[1314]).toEqual({
      mark: 100,
      bonus: false,
    });

    toggle(1314);
    expect(usePlannedProjects.getState().planned[1314]).toBeUndefined();
  });

  it("updates config without dropping the project", () => {
    const { toggle, setConfig } = usePlannedProjects.getState();
    toggle(42);
    setConfig(42, { mark: 125, bonus: true });
    expect(usePlannedProjects.getState().planned[42]).toEqual({
      mark: 125,
      bonus: true,
    });
  });

  it("reconcile drops projects that became actually completed", () => {
    const { toggle, reconcile } = usePlannedProjects.getState();
    toggle(1);
    toggle(2);
    toggle(3);

    reconcile([2, 999]); // 2 is now validated; 999 was never planned

    const planned = usePlannedProjects.getState().planned;
    expect(planned[1]).toBeDefined();
    expect(planned[2]).toBeUndefined();
    expect(planned[3]).toBeDefined();
  });

  it("persists to localStorage under the shared key", () => {
    usePlannedProjects.getState().toggle(7);
    const raw = window.localStorage.getItem("42calc:planned-projects");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string).state.planned[7]).toEqual({
      mark: 100,
      bonus: false,
    });
  });
});
