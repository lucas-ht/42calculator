"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Column as ColumnInstance } from "@tanstack/react-table";
import { Ellipsis } from "lucide-react";
import type { Row } from "@tanstack/react-table";
import { ChevronsUpDownIcon, Trash2 } from "lucide-react";
import { useCalculatorStore } from "@/providers/calculator-store-provider";

export function TableAction<TData>({
  columns,
}: {
  columns: ColumnInstance<TData>[];
}) {
  const { resetProjects } = useCalculatorStore((state) => state);

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
        <DropdownMenuItem
          onClick={() => {
            resetProjects();
          }}
        >
          <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <Trash2 className="size-4 transition-colors group-hover:stroke-destructive" />
          </span>
          <span className="transition-colors group-hover:text-destructive">
            Reset projects
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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

export function ToggleExpand<TData>({ row }: { row: Row<TData> }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="group"
      onClick={row.getToggleExpandedHandler()}
      aria-label="Expand row"
    >
      <ChevronsUpDownIcon className="size-4" />
    </Button>
  );
}
