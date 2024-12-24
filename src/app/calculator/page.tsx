import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getFortyTwoCursus } from "@/lib/forty-two/cursus";
import { getFortyTwoLevels } from "@/lib/forty-two/forty-two-experience";
import { getFortyTwoProjects } from "@/lib/forty-two/forty-two-projects";
import { CalculatorStoreProvider } from "@/providers/calculator-store-provider";
import { FortyTwoStoreProvider } from "@/providers/forty-two-store-provider";
import { Suspense } from "react";
import CalculatorTable from "./(table)/table";

function CalculatorSkeleton() {
  return <Skeleton className="h-[246.5px] w-full" />;
}

async function Calculator() {
  const cursus = await getFortyTwoCursus();
  const projects = await getFortyTwoProjects();
  const levels = await getFortyTwoLevels();

  return (
    <FortyTwoStoreProvider
      cursus={cursus}
      levels={levels}
      projects={projects}
    >
      <CalculatorStoreProvider>
        <CalculatorTable />
      </CalculatorStoreProvider>
    </FortyTwoStoreProvider>
  );
}

export default function CalculatorPage() {
  return (
    <main className="container flex grow items-start justify-center p-4 md:p-12 lg:p-24">
      <Card className="w-full bg-card/5 backdrop-blur">
        <CardHeader>
          <CardTitle tag="h1">Calculator</CardTitle>
          <CardDescription>
            Calculate your level based on your future 42 projects.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          <Suspense fallback={<CalculatorSkeleton />}>
            <Calculator />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
