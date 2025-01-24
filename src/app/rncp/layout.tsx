import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getFortyTwoCursus } from "@/lib/forty-two/cursus";
import { getFortyTwoProjects } from "@/lib/forty-two/forty-two-projects";
import { getFortyTwoTitles } from "@/lib/forty-two/forty-two-rncp";
import { FortyTwoStoreProvider } from "@/providers/forty-two-store-provider";
import { Suspense } from "react";

function TitlesSkeleton() {
  return <Skeleton className="h-[246.5px] w-full" />;
}

async function TitlesProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cursus = await getFortyTwoCursus();
  const projects = await getFortyTwoProjects();
  const titles = await getFortyTwoTitles();

  return (
    <FortyTwoStoreProvider
      cursus={cursus}
      titles={titles}
      projects={projects}
    >
      {children}
    </FortyTwoStoreProvider>
  );
}

export default function TitlesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="container flex grow items-start justify-center p-4 md:p-12 lg:p-24">
      <Card className="w-full bg-card/5 backdrop-blur">
        <CardHeader>
          <CardTitle tag="h1">RNCP</CardTitle>
          <CardDescription>Track your RNCP progress.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <Suspense fallback={<TitlesSkeleton />}>
            <TitlesProvider>{children}</TitlesProvider>
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
