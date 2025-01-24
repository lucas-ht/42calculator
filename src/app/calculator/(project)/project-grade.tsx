"use client";

import { Input } from "@/components/ui/input";
import { useCalculatorStore } from "@/stores/use-calculator-store";
import type { CalculatorEntry } from "@/types/forty-two";
import type React from "react";
import { useEffect, useState } from "react";
import { z } from "zod";

export function ProjectGrade({
  entry,
}: {
  entry: CalculatorEntry;
}) {
  const [inputValue, setInputValue] = useState<number | null>(
    entry.project.mark ?? null,
  );
  const { updateProject } = useCalculatorStore((state) => state);
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
    }
  };

  return (
    <Input
      value={inputValue ?? ""}
      onChange={handleInputChange}
      placeholder="100"
      className="min-w-[52px] max-w-[100px]"
      aria-label="Project grade"
    />
  );
}
