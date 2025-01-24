"use client";

"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Column as ColumnInstance } from "@tanstack/react-table";
import { Ellipsis } from "lucide-react";
import type { Row } from "@tanstack/react-table";
import { ChevronsUpDownIcon } from "lucide-react";

export function TableAction<TData>({
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
