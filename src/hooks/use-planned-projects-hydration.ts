"use client";

import { usePlannedProjects } from "@/stores/planned-projects-store";
import { useEffect } from "react";

/**
 * Rehydrate the persisted planned-projects store on the client (kept out of
 * SSR to avoid hydration mismatches), then reconcile: any planned project the
 * student has since actually completed (validated in the 42 API) is dropped,
 * so "expected" projects that became real stop being simulated.
 */
export function usePlannedProjectsHydration(validatedProjectIds: number[]) {
  useEffect(() => {
    let active = true;

    void Promise.resolve(usePlannedProjects.persist.rehydrate()).then(() => {
      if (active && validatedProjectIds.length > 0) {
        usePlannedProjects.getState().reconcile(validatedProjectIds);
      }
    });

    return () => {
      active = false;
    };
    // validatedProjectIds is derived from static, server-rendered cursus data;
    // this should run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
