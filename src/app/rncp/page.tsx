"use client";

import { PlannedProjectsSync } from "@/components/planned-projects-sync";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import { useFortyTwoStore } from "@/providers/forty-two-store-provider";
import { usePlannedProjects } from "@/stores/planned-projects-store";
import type { FortyTwoTitle } from "@/types/forty-two";
import { useState } from "react";
import { RncpGraph } from "./(graph)/rncp-graph";
import { TitleOptions } from "./(options)/options";
import { TitleRequirements } from "./(options)/requirements";
import { TitleSelector } from "./selector";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LayoutList, RotateCcw, Share2 } from "lucide-react";
import { track } from "@vercel/analytics";

type RncpView = "list" | "graph";

export default function Titles() {
  const { titles } = useFortyTwoStore((state) => state);
  const [view, setView] = useLocalStorage<RncpView>("rncp:view", "list");
  const [activeTitle, _setActiveTitle] = useState<FortyTwoTitle | null>(
    titles[0] ?? null,
  );

  const setActiveTitle = (title: FortyTwoTitle | null) => {
    if (!title) {
      return;
    }

    _setActiveTitle(title);

    track("rncp-title-switched", {
      title: title?.title,
    });
  };

  if (!activeTitle) {
    return null;
  }

  return (
    <>
      <PlannedProjectsSync />

      <div className="mb-6 flex items-center justify-between gap-4">
        <ViewToggle
          view={view}
          setView={setView}
        />
        <ResetSimulationButton />
      </div>

      {view === "graph" ? (
        <RncpGraph titles={titles} />
      ) : (
        <>
          <TitleSelector
            titles={titles}
            activeTitle={activeTitle}
            setActiveTitle={setActiveTitle}
          />

          <Separator className="my-6" />

          <div className="my-6 space-y-1.5">
            <h4 className="font-semibold text-2xl leading-none tracking-tight">
              Information
            </h4>

            <p className="text-muted-foreground text-sm">
              You must validate the 'Suite' tab, one of the option tabs, and the
              requirements. Click a project to simulate completing it.{" "}
              <Link
                className="underline underline-offset-1 transition-colors hover:text-foreground"
                prefetch={false}
                href="https://meta.intra.42.fr/articles/rncp-7-certificate"
              >
                Learn more.
              </Link>
            </p>
          </div>

          <TitleRequirements
            title={activeTitle}
            className="my-6"
          />
          <TitleOptions title={activeTitle} />
        </>
      )}
    </>
  );
}

function ViewToggle({
  view,
  setView,
}: {
  view: RncpView;
  setView: (view: RncpView) => void;
}) {
  return (
    <div className="inline-flex rounded-md border p-0.5">
      {(
        [
          { id: "list", label: "List", Icon: LayoutList },
          { id: "graph", label: "Graph", Icon: Share2 },
        ] as const
      ).map(({ id, label, Icon }) => (
        <Button
          key={id}
          variant={view === id ? "secondary" : "ghost"}
          size="sm"
          className={cn("gap-1.5", view !== id && "text-muted-foreground")}
          onClick={() => setView(id)}
          aria-pressed={view === id}
        >
          <Icon className="size-4" />
          {label}
        </Button>
      ))}
    </div>
  );
}

function ResetSimulationButton() {
  const { planned, clear } = usePlannedProjects((state) => state);
  const count = Object.keys(planned).length;

  if (count === 0) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="shrink-0"
      onClick={() => clear()}
    >
      <RotateCcw className="mr-2 size-4" />
      Reset ({count})
    </Button>
  );
}
