"use client";

import { useMemo } from "react";
import { usePlannedProjectsHydration } from "@/hooks/use-planned-projects-hydration";
import { useFortyTwoStore } from "@/providers/forty-two-store-provider";

/**
 * Mount inside a FortyTwoStoreProvider (RNCP and Calculator pages). Rehydrates
 * the shared planned-projects store and reconciles it against the user's
 * actually-completed projects. Renders nothing.
 */
export function PlannedProjectsSync() {
  const { cursus, projects } = useFortyTwoStore((state) => state);

  const validatedProjectIds = useMemo(
    () => [
      ...Object.values(cursus.projects)
        .filter((project) => project.is_validated)
        .map((project) => project.id),
      ...Object.values(projects)
        .filter(
          (project) =>
            project.completionProjectId &&
            cursus.projects[project.completionProjectId]?.is_validated,
        )
        .map((project) => project.id),
    ],
    [cursus, projects],
  );

  usePlannedProjectsHydration(validatedProjectIds);

  return null;
}
