"use client";

import type { RowData } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { AddProject } from "../(project)/project-add";
import type {
  CalculatorRow as Row,
  CalculatorTable as TableInstance,
} from "../table-config";
import { columns } from "./table-columns";

function DataTableAddProject() {
  return (
    <TableRow className="hover:bg-inherit">
      <TableCell
        colSpan={columns.length}
        className="h-24 text-center"
      >
        <AddProject />
      </TableCell>
    </TableRow>
  );
}

function DataTableProject<TData extends RowData>({
  table,
  row,
}: {
  table: TableInstance<TData>;
  row: Row<TData>;
}) {
  return (
    <>
      <TableRow>
        {row.getVisibleCells().map((cell) => (
          <TableCell
            key={cell.id}
            className={cn(
              table.options.meta?.className,
              cell.column.columnDef.meta?.className,
            )}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
      {row.subRows.map((subRow) => {
        if (!subRow.getIsExpanded()) {
          return null;
        }

        return (
          <DataTableProject
            key={subRow.id}
            table={table}
            row={subRow}
          />
        );
      })}
    </>
  );
}

export function DataTableBody<TData extends RowData>({
  table,
}: {
  table: TableInstance<TData>;
}) {
  return (
    <TableBody>
      {table.getRowModel().rows.map((row) => (
        <DataTableProject
          key={row.id}
          table={table}
          row={row}
        />
      ))}
      <DataTableAddProject />
    </TableBody>
  );
}
