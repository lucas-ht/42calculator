"use client";

import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  type Table as TableInstance,
  flexRender,
  type Row,
} from "@tanstack/react-table";
import { columns } from "./table-columns";
import { cn } from "@/lib/utils";
import { AddProject } from "../(project)/project-add";

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

function DataTableProject<TData>({
  table,
  row,
}: { table: TableInstance<TData>; row: Row<TData> }) {
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

export function DataTableBody<TData>({
  table,
}: { table: TableInstance<TData> }) {
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
