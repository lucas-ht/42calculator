"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useCalculatorStore } from "@/providers/calculator-store-provider";
import { useFortyTwoStore } from "@/providers/forty-two-store-provider";
import type { FortyTwoProjectCalculator } from "@/types/forty-two";
import { CirclePlus, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { z } from "zod";

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

export function AddProject() {
  const [open, setOpen] = useState(false);
  const [, setValue] = useState("");
  const { addProject } = useCalculatorStore((state) => state);
  const { projects } = useFortyTwoStore((state) => state);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          // biome-ignore lint: The role attribute is fine
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label="Add project"
        >
          Add a project
          <CirclePlus className="ml-2 size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[200px] p-0"
        align="center"
      >
        <Command>
          <CommandInput placeholder="Search projects..." />
          <CommandEmpty>No projects found.</CommandEmpty>
          <CommandGroup>
            <ScrollArea className="h-[250px]">
              {Object.values(projects).map((project) => (
                <CommandItem
                  key={project.id}
                  value={project.name}
                  onSelect={() => {
                    addProject(project);

                    setValue("");
                    setOpen(false);
                  }}
                  // biome-ignore lint: The role attribute is fine
                  role="option"
                  aria-label={`Select project ${project.name}`}
                >
                  {project.name}
                </CommandItem>
              ))}
            </ScrollArea>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function RemoveProject({
  project,
}: {
  project: FortyTwoProjectCalculator;
}) {
  const { removeProject } = useCalculatorStore((state) => state);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="group"
      onClick={() => {
        removeProject(project.id);
      }}
      aria-label="Remove project"
    >
      <Trash2 className="size-4 transition-colors group-hover:stroke-destructive" />
    </Button>
  );
}

export function ProjectGrade({
  project,
}: {
  project: FortyTwoProjectCalculator;
}) {
  const [inputValue, setInputValue] = useState<number | null>(
    project.mark ?? null,
  );
  const { updateProject } = useCalculatorStore((state) => state);
  const gradeSchema = z.number().min(0).max(125);

  useEffect(() => {
    setInputValue(project.mark ?? null);
  }, [project.mark]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === "") {
      setInputValue(null);
      updateProject({ ...project, mark: 0 });
      return;
    }

    const newValue = Number(event.target.value);
    if (gradeSchema.safeParse(newValue).success) {
      setInputValue(newValue);
      updateProject({ ...project, mark: newValue });
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

export function ProjectBonus({
  project,
}: {
  project: FortyTwoProjectCalculator;
}) {
  const { updateProject } = useCalculatorStore((state) => state);

  return (
    <Switch
      checked={project.bonus}
      onCheckedChange={(checked) => {
        updateProject({ ...project, bonus: checked });
      }}
      aria-label="Project bonus"
    />
  );
}
