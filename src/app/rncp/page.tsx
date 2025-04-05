import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Rncp from "./rncp";
import { CalculatorTable } from "../calculator/table";
import { Separator } from "@/components/ui/separator";

export default function RncpPage() {
  return (
    <>
      <Rncp />

      <Separator className="my-6" />

      <CardHeader className="p-0 my-6 space-y-1.5">
        <CardTitle tag="h1">Calculator</CardTitle>
        <CardDescription>
          Calculate your level based on your future 42 projects.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <CalculatorTable />
      </CardContent>
    </>
  );
}
