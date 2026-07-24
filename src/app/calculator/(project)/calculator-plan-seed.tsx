"use client";

import { useCalculatorStore } from "@/providers/calculator-store-provider";
import { useFortyTwoStore } from "@/providers/forty-two-store-provider";
import { usePlannedProjects } from "@/stores/planned-projects-store";
import { useEffect } from "react";

/**
 * Seeds the (ephemeral, per-mount) calculator with the shared planned projects,
 * so a project simulated in the RNCP tool shows up here automatically. Add-only
 * and guarded by the current entries, so it converges without loops. Renders
 * nothing.
 */
export function CalculatorPlanSeed() {
  const { projects } = useFortyTwoStore((state) => state);
  const planned = usePlannedProjects((state) => state.planned);
  const addProject = useCalculatorStore((state) => state.addProject);
  const entries = useCalculatorStore((state) => state.entries);

  useEffect(() => {
    for (const projectId of Object.keys(planned).map(Number)) {
      if (!entries[projectId] && projects[projectId]) {
        addProject(projects[projectId], planned[projectId]);
      }
    }
  }, [planned, entries, projects, addProject]);

  return null;
}
