"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCalculatorStore } from "@/providers/calculator-store-provider";
import { useFortyTwoStore } from "@/providers/forty-two-store-provider";
import { CirclePlus } from "lucide-react";
import { useState } from "react";

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
