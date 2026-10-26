"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useCalculatorStore } from "@/providers/calculator-store-provider";
import { usePlannedProjects } from "@/stores/planned-projects-store";
import type { CalculatorEntry } from "@/types/forty-two";

export function ProjectGrade({ entry }: { entry: CalculatorEntry }) {
  const [inputValue, setInputValue] = useState<number | null>(
    entry.project.mark ?? null,
  );
  const { updateProject } = useCalculatorStore((state) => state);
  const persistConfig = usePlannedProjects((state) => state.setConfig);
  const gradeSchema = z.number().min(0).max(125);

  useEffect(() => {
    setInputValue(entry.project.mark ?? null);
  }, [entry.project.mark]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === "") {
      setInputValue(null);
      updateProject({
        ...entry,
        project: {
          ...entry.project,
          mark: 0,
        },
      });
      persistConfig(entry.project.id, { mark: 0 }, entry.parentId);
      return;
    }

    const newValue = Number(event.target.value);
    if (gradeSchema.safeParse(newValue).success) {
      setInputValue(newValue);
      updateProject({
        ...entry,
        project: {
          ...entry.project,
          mark: newValue,
        },
      });
      persistConfig(entry.project.id, { mark: newValue }, entry.parentId);
    }
  };

  return (
    <Input
      disabled={entry.alreadyEarned}
      title={
        entry.alreadyEarned
          ? "Already included in your starting level"
          : undefined
      }
      value={inputValue ?? ""}
      onChange={handleInputChange}
      placeholder="100"
      className="min-w-[52px] max-w-[100px]"
      aria-label="Project grade"
    />
  );
}
