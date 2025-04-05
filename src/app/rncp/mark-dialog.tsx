import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCalculatorStore } from "@/providers/calculator-store-provider";
import type { FortyTwoProject } from "@/types/forty-two";
import { cn } from "@/lib/utils";
import { useFortyTwoStore } from "@/providers/forty-two-store-provider";

interface MarkDialogProps {
  project: FortyTwoProject;
  isCompleted: boolean;
}

export function MarkDialog({ project, isCompleted }: MarkDialogProps) {
  const [open, setOpen] = useState(false);
  const [mark, setMark] = useState(isCompleted ? project.mark || 100 : 100);
  const cursus = useFortyTwoStore((state) => state.cursus);
  const calculatorStore = useCalculatorStore((state) => state);

  useEffect(() => {
    setMark(
      calculatorStore.entries[project.id]
        ? calculatorStore.entries[project.id].project.mark || 100
        : isCompleted && cursus.projects[project.id]
        ? cursus.projects[project.id].mark || 100
        : 100
    );
  }, [calculatorStore.entries[project.id], cursus.projects[project.id]]);

  const handleMarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 125) {
      setMark(value);
    }
  };

  const handleSave = () => {
    if (calculatorStore.entries[project.id]) {
      calculatorStore.updateProject({
        ...calculatorStore.entries[project.id],
        project: {
          ...calculatorStore.entries[project.id].project,
          mark,
        },
      });
    } else {
      calculatorStore.addProject({ ...project, mark, bonus: false });
    }

    setOpen(false);
  };

  const handleRemove = () => {
    if (!calculatorStore.entries[project.id]) return;

    calculatorStore.removeProject(project.id);
    setOpen(false);
  };

  if (
    !calculatorStore.entries[project.id] &&
    cursus.projects[project.id] &&
    isCompleted
  )
    return (
      <Badge className="rounded-lg hover:bg-primary/90" variant="default">
        {cursus.projects[project.id].mark}
      </Badge>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Badge
          className={cn(
            "rounded-lg cursor-pointer",
            calculatorStore.entries[project.id]
              ? "-outline-offset-2 outline-primary-foreground outline-2 outline-dashed bg-primary text-primary-foreground hover:bg-primary/80"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          {calculatorStore.entries[project.id] ? (
            calculatorStore.entries[project.id].project.mark
          ) : (
            <Plus className="size-4" />
          )}
        </Badge>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{project.name}</DialogTitle>
          <DialogDescription>
            Set the mark for this project. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="mark" className="text-right">
              Mark
            </label>
            <Input
              id="mark"
              type="number"
              min={0}
              max={125}
              value={mark}
              onChange={handleMarkChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right">Experience</div>
            <div className="col-span-3">
              {((project.experience || 0) * (mark / 100)).toFixed(0)} XP
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          {calculatorStore.entries[project.id] && (
            <Button variant="destructive" onClick={handleRemove}>
              Remove
            </Button>
          )}
          <Button type="submit" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
