"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useCalculatorStore } from "@/providers/calculator-store-provider";
import type { CalculatorEntry } from "@/types/forty-two";
import { Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";

const LEVEL_REGEX = /^\d{1,2}(\.\d{0,2})?$/;

export function StartLevel() {
  const { level, setLevel } = useCalculatorStore((state) => state);
  const [inputValue, setInputValue] = useState<string | null>(
    level.start.toFixed(2),
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === "") {
      setInputValue(null);
      setLevel(0);
      return;
    }

    const newValue = Number(event.target.value);
    if (newValue > 30.0) {
      return;
    }

    if (LEVEL_REGEX.test(event.target.value)) {
      setInputValue(event.target.value);
      setLevel(newValue);
    }
  };

  return (
    <Input
      value={inputValue ?? ""}
      onChange={handleInputChange}
      placeholder="1.00"
      className="inline-flex max-w-[64px] flex-none "
      aria-label="Level"
    />
  );
}

export function RemoveProject({
  entry,
}: {
  entry: CalculatorEntry;
}) {
  const { removeProject } = useCalculatorStore((state) => state);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="group"
      onClick={() => {
        removeProject(entry.project.id);
      }}
      aria-label="Remove project"
    >
      <Trash2 className="size-4 transition-colors group-hover:stroke-destructive" />
    </Button>
  );
}

export function ProjectBonus({
  entry,
}: {
  entry: CalculatorEntry;
}) {
  const { updateProject } = useCalculatorStore((state) => state);

  return (
    <Switch
      checked={entry.project.bonus}
      onCheckedChange={(checked) => {
        updateProject({
          ...entry,
          project: {
            ...entry.project,
            bonus: checked,
          },
        });
      }}
      aria-label="Project bonus"
    />
  );
}
