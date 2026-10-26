"use client";

import type { RowData } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import {
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { StartLevel } from "../(project)/project-actions";
import type { CalculatorTable as TableInstance } from "../table-config";

export function DataTableHeader<TData extends RowData>({
  table,
}: {
  table: TableInstance<TData>;
}) {
  return (
    <>
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead
            colSpan={table.getVisibleFlatColumns().length - 2}
            className={cn(table.options.meta?.className, "text-inherit")}
          >
            Start level
          </TableHead>
          <TableHead
            colSpan={2}
            className={cn(
              table.options.meta?.className,
              "text-right font-semibold text-inherit md:px-1",
            )}
          >
            <StartLevel />
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead
                  key={header.id}
                  className={cn(
                    table.options.meta?.className,
                    header.column.columnDef.meta?.className,
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
    </>
  );
}

export function DataTableFooter<TData extends RowData>({
  table,
  levelEnd,
}: {
  table: TableInstance<TData>;
  levelEnd: number;
}) {
  return (
    <>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={table.getVisibleFlatColumns().length - 2}>
            End level
          </TableCell>
          <TableCell
            colSpan={2}
            className="text-right font-semibold"
          >
            {levelEnd.toFixed(2)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </>
  );
}
