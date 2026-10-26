"use client";

import {
  type ColumnVisibilityState,
  type ExpandedState,
  useTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { PlannedProjectsSync } from "@/components/planned-projects-sync";
import { Table } from "@/components/ui/table";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  CalculatorStoreProvider,
  useCalculatorStore,
} from "@/providers/calculator-store-provider";
import { FortyTwoStoreProvider } from "@/providers/forty-two-store-provider";
import type {
  FortyTwoCursus,
  FortyTwoLevel,
  FortyTwoProject,
} from "@/types/forty-two";
import { CalculatorPlanSeed } from "./(project)/calculator-plan-seed";
import { TableAction } from "./(table)/table-actions";
import { DataTableBody } from "./(table)/table-body";
import { columns } from "./(table)/table-columns";
import { DataTableFooter, DataTableHeader } from "./(table)/table-decoration";
import { calculatorFeatures } from "./table-config";

export function Calculator({
  cursus,
  levels,
  projects,
}: {
  cursus?: FortyTwoCursus;
  levels?: Record<number, FortyTwoLevel>;
  projects?: Record<number, FortyTwoProject>;
}) {
  return (
    <FortyTwoStoreProvider
      cursus={cursus}
      levels={levels}
      projects={projects}
    >
      <PlannedProjectsSync />
      <CalculatorStoreProvider>
        <CalculatorPlanSeed />
        <CalculatorTable />
      </CalculatorStoreProvider>
    </FortyTwoStoreProvider>
  );
}

function CalculatorTable() {
  const { entries, getProjects, level } = useCalculatorStore((state) => state);

  //biome-ignore lint: The getProjects dependency is not needed here
  const data = useMemo(() => getProjects(), [entries]);

  const [expanded, setExpanded] = useState<ExpandedState>({});
  // Persisted across reloads so the user's Base/Gained Experience column
  // choices stick.
  const [columnVisibility, setColumnVisibility] =
    useLocalStorage<ColumnVisibilityState>(
      "calculator:column-visibility",
      columns.reduce((acc, column) => {
        if (column.id !== undefined) {
          acc[column.id] = column.meta?.visible ?? true;
        }

        return acc;
      }, {} as ColumnVisibilityState),
    );

  const table = useTable({
    features: calculatorFeatures,
    data,
    columns,
    state: {
      expanded,
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: setExpanded,
    meta: {
      className: "px-2 md:px-4 truncate",
    },
    getSubRows: (row) => row.children,
    autoResetExpanded: false,
  });

  return (
    <>
      <div className="-mt-12 hidden h-12 justify-end pb-1 md:flex">
        <TableAction
          columns={table.getAllColumns().filter((col) => col.getCanHide())}
        />
      </div>
      <div className="border-t md:rounded-md md:border">
        <Table>
          <DataTableHeader table={table} />
          <DataTableBody table={table} />
          <DataTableFooter
            table={table}
            levelEnd={level.end}
          />
        </Table>
      </div>
    </>
  );
}
