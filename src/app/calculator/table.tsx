"use client";

import { Table } from "@/components/ui/table";
import { CalculatorStoreProvider } from "@/providers/calculator-store-provider";
import { useCalculatorStore } from "@/providers/calculator-store-provider";
import {
  type VisibilityState,
  type ExpandedState,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { columns } from "./(table)/table-columns";
import { DataTableBody } from "./(table)/table-body";
import { TableAction } from "./(table)/table-actions";
import { DataTableHeader, DataTableFooter } from "./(table)/table-decoration";
import { FortyTwoStoreProvider } from "@/providers/forty-two-store-provider";
import type {
  FortyTwoCursus,
  FortyTwoLevel,
  FortyTwoProject,
} from "@/types/forty-two";

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
      <CalculatorStoreProvider>
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
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    columns.reduce((acc, column) => {
      if (column.id !== undefined) {
        acc[column.id] = column.meta?.visible ?? true;
      }

      return acc;
    }, {} as VisibilityState),
  );

  const table = useReactTable({
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
    getExpandedRowModel: getExpandedRowModel(),
    getCoreRowModel: getCoreRowModel(),
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
