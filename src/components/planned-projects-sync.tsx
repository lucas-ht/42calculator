"use client";

import { usePlannedProjectsHydration } from "@/hooks/use-planned-projects-hydration";
import { useFortyTwoStore } from "@/providers/forty-two-store-provider";
import { useMemo } from "react";

/**
 * Mount inside a FortyTwoStoreProvider (RNCP and Calculator pages). Rehydrates
 * the shared planned-projects store and reconciles it against the user's
 * actually-completed projects. Renders nothing.
 */
export function PlannedProjectsSync() {
  const { cursus } = useFortyTwoStore((state) => state);

  const validatedProjectIds = useMemo(
    () =>
      Object.values(cursus.projects)
        .filter((project) => project.is_validated)
        .map((project) => project.id),
    [cursus],
  );

  usePlannedProjectsHydration(validatedProjectIds);

  return null;
}
