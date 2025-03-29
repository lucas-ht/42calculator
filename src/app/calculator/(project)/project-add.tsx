"use client";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCalculatorStore } from "@/providers/calculator-store-provider";
import { useFortyTwoStore } from "@/providers/forty-two-store-provider";
import { CirclePlus } from "lucide-react";
import { useState } from "react";

export function AddProject() {
  const [open, setOpen] = useState(false);
  const [, setValue] = useState("");
  const { addProject } = useCalculatorStore((state) => state);
  let { projects } = useFortyTwoStore((state) => state);

  projects = Object.values(projects).filter((project) => !project.parentId);

  return (
    <>
      <Button
        variant="secondary"
        // biome-ignore lint: The role attribute is fine
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Add project"
        onClick={() => {
          setOpen((prev) => !prev);
        }}
      >
        Add a project
        <CirclePlus className="ml-2 size-4" />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Add a project"
      >
        <CommandInput placeholder="Search projects..." />
        <CommandList>
          <CommandEmpty>No projects found.</CommandEmpty>
          <CommandGroup heading="Projects">
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
                  className="h-8 cursor-pointer"
                  // biome-ignore lint: The role attribute is fine
                  role="option"
                  aria-label={`Select project ${project.name}`}
                >
                  {project.name}
                </CommandItem>
              ))}
            </ScrollArea>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
