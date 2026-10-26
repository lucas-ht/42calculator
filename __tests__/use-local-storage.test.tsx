import { act, renderHook } from "@testing-library/react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import "@testing-library/jest-dom";

describe("useLocalStorage", () => {
  beforeEach(() => window.localStorage.clear());

  it("starts with the initial value", () => {
    const { result } = renderHook(() =>
      useLocalStorage("k", { "base experience": false }),
    );
    expect(result.current[0]).toEqual({ "base experience": false });
  });

  it("writes updates to localStorage (incl. functional updates from the table)", () => {
    const { result } = renderHook(() =>
      useLocalStorage("k", { "base experience": false }),
    );

    // tanstack calls the setter with an updater function
    act(() => {
      result.current[1]((prev) => ({ ...prev, "base experience": true }));
    });

    expect(JSON.parse(window.localStorage.getItem("k") as string)).toEqual({
      "base experience": true,
    });
  });

  it("loads the persisted value on a fresh mount (survives reload)", () => {
    window.localStorage.setItem(
      "k",
      JSON.stringify({ "base experience": true }),
    );

    const { result } = renderHook(() =>
      useLocalStorage("k", { "base experience": false }),
    );

    // after the mount effect runs, the stored value should be applied
    expect(result.current[0]).toEqual({ "base experience": true });
  });
});
