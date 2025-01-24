"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  useCalculatorStore,
  useCalculatorStoreHydrator,
} from "@/stores/use-calculator-store";
import {
  type Column as ColumnInstance,
  type Table as TableInstance,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Ellipsis } from "lucide-react";
import { useMemo, useState } from "react";
import { AddProject, StartLevel } from "./actions";
import { columns } from "./columns";

function ColumnVisibility<TData>({
  columns,
}: {
  columns: ColumnInstance<TData>[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
        >
          <Ellipsis className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            className="capitalize"
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(value)}
          >
            {column.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CalculatorHeader<TData>({ table }: { table: TableInstance<TData> }) {
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

function CalculatorBody<TData>({ table }: { table: TableInstance<TData> }) {
  return (
    <TableBody>
      {table.getRowModel().rows.map((row) => (
        <TableRow key={row.id}>
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
      ))}
      <TableRow className="hover:bg-inherit">
        <TableCell
          colSpan={columns.length}
          className="h-24 text-center"
        >
          <AddProject />
        </TableCell>
      </TableRow>
    </TableBody>
  );
}

function CalculatorFooter<TData>({
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

export function CalculatorTable() {
  useCalculatorStoreHydrator();

  const {
    entries: nodes,
    getProjects,
    level,
  } = useCalculatorStore((state) => state);

  //biome-ignore lint: The getProjects dependency is not needed here
  const data = useMemo(() => getProjects(), [nodes]);

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
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
    meta: {
      className: "px-2 md:px-4 truncate",
    },
  });

  return (
    <>
      <div className="-mt-12 hidden h-12 justify-end pb-1 lg:flex">
        <ColumnVisibility
          columns={table.getAllColumns().filter((col) => col.getCanHide())}
        />
      </div>
      <div className="border-t md:rounded-md md:border">
        <Table>
          <CalculatorHeader table={table} />
          <CalculatorBody table={table} />
          <CalculatorFooter
            table={table}
            levelEnd={level.end}
          />
        </Table>
      </div>
    </>
  );
}

export default CalculatorTable;
