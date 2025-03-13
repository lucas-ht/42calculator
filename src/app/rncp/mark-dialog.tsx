import { useState, useEffect } from "react";
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
import { fortyTwoStore } from "@/providers/forty-two-store-provider";
import { useFortyTwoStore } from "@/providers/forty-two-store-provider";
import type { FortyTwoProject } from "@/types/forty-two";

interface MarkDialogProps {
  project: FortyTwoProject;
  isCompleted: boolean;
}

export function MarkDialog({ project, isCompleted }: MarkDialogProps) {
  const [open, setOpen] = useState(false);
  const [mark, setMark] = useState(isCompleted ? (project.mark || 100) : 100);
  const cursus = useFortyTwoStore((state) => state.cursus);
  
  useEffect(() => {
    if (open) {
      setMark(isCompleted && cursus.projects[project.id] 
        ? (cursus.projects[project.id].mark || 100) 
        : 100);
    }
  }, [open, project.id, isCompleted, cursus.projects]);

  const handleMarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 125) {
      setMark(value);
    }
  };

  const handleSave = () => {
    const store = fortyTwoStore.getState();
    const updatedCursus = { ...store.cursus };
    
    if (isCompleted) {
      updatedCursus.projects = {
        ...updatedCursus.projects,
        [project.id]: {
          ...updatedCursus.projects[project.id],
          mark,
        },
      };
    } else {
      updatedCursus.projects = {
        ...updatedCursus.projects,
        [project.id]: {
          ...project,
          mark,
        },
      };
    }
    
    fortyTwoStore.setState({
      ...store,
      cursus: updatedCursus,
    });
    
    setOpen(false);
  };

  const handleRemove = () => {
    if (!isCompleted) return;
    
    const store = fortyTwoStore.getState();
    const updatedCursus = { ...store.cursus };
    
    const { [project.id]: _, ...remainingProjects } = updatedCursus.projects;
    
    updatedCursus.projects = remainingProjects;
    
    fortyTwoStore.setState({
      ...store,
      cursus: updatedCursus,
    });
    
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Badge className="rounded-lg cursor-pointer hover:bg-primary/90" variant={isCompleted ? "default" : "secondary"}>
          {isCompleted ? cursus.projects[project.id].mark : <Plus className="size-3" />}
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
          {isCompleted && (
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