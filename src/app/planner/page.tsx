import type { Metadata } from "next";
import { Planner } from "@/components/planner/planner";
import {
  type PlannerData,
  type PlannerInitialState,
  TITLE_KEYS,
  type TitleKey,
} from "@/components/planner/types";
import { Card, CardContent } from "@/components/ui/card";
import plannerData from "@/data/planner.json";

export const metadata: Metadata = {
  title: "RNCP planner",
  description:
    "Shortest list of projects to get any combination of the four RNCP titles",
};

const data = plannerData as unknown as PlannerData;

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseInitial(params: SearchParams): PlannerInitialState {
  const titles = (first(params.titles) ?? "")
    .split(",")
    .filter((key): key is TitleKey => TITLE_KEYS.includes(key as TitleKey));

  return {
    titles: titles.length > 0 ? titles : null,
    mode: first(params.mode) === "projects" ? "projects" : "days",
    view: first(params.view) === "compare" ? "compare" : "plan",
  };
}

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const initial = parseInitial(await searchParams);

  return (
    <main className="@container flex grow justify-center p-4">
      <Card className="bg-card/5 flex flex-col backdrop-blur-sm @max-[1400px]:w-full @min-[1400px]:w-[1400px]">
        <CardContent className="flex grow flex-col p-4 pb-0 md:px-6">
          <Planner
            data={data}
            initial={initial}
          />
        </CardContent>
      </Card>
    </main>
  );
}
