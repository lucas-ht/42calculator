import { track } from "@/lib/analytics";

describe("track", () => {
  afterEach(() => {
    window.op = undefined as unknown as typeof window.op;
  });

  it("forwards the event to the OpenPanel queue", () => {
    const op = jest.fn();
    window.op = op as unknown as typeof window.op;

    track("sign-in-clicked", { login: "pulgamec" });

    expect(op).toHaveBeenCalledWith("track", "sign-in-clicked", {
      login: "pulgamec",
    });
  });

  it("does not throw before the OpenPanel script has loaded", () => {
    expect(() => track("rncp-view-switched", { view: "graph" })).not.toThrow();
  });
});
