import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container flex grow items-start justify-center p-4 md:p-12 lg:p-24">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle tag="h1">Not Found</CardTitle>
          <CardDescription>
            Could not find the requested resource.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <Button
            variant="secondary"
            asChild
          >
            <Link href="/">Go back home</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
