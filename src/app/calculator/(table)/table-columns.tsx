"use client";

import type { CalculatorEntry } from "@/types/forty-two";
import type { ColumnDef } from "@tanstack/react-table";
import { ProjectBonus, RemoveProject } from "../(project)/project-actions";
import { ProjectGrade } from "../(project)/project-grade";
import { CornerDownRightIcon } from "lucide-react";
import { ToggleExpand } from "./table-actions";

export const columns: ColumnDef<CalculatorEntry>[] = [
  {
    id: "remove",
    enableHiding: false,
    cell: ({ row }) => {
      if (row.depth > 0) {
        return null;
      }
      return <RemoveProject entry={row.original} />;
    },
    meta: {
      className: "w-8 md:w-14 px-0 md:px-1",
    },
  },
  {
    id: "expand",
    enableHiding: false,
    cell: ({ row }) => {
      if (!row.getCanExpand()) {
        return null;
      }
      return <ToggleExpand row={row} />;
    },
    meta: {
      className: "w-8 md:w-10 px-0 md:px-1",
    },
  },
  {
    id: "name",
    header: "Name",
    accessorKey: "project.name",
    enableHiding: false,
    cell: ({ row }) => {
      const entry = row.original;
      return (
        <div className="flex items-center">
          {row.depth > 0 && (
            <CornerDownRightIcon className="mr-2 size-4 shrink-0 text-muted-foreground/50" />
          )}
          {entry.project.name}
        </div>
      );
    },
    meta: {
      className: "max-w-[60px] md:max-w-[200px] xl:max-w-none",
    },
  },
  {
    id: "mark",
    header: "Mark",
    enableHiding: false,
    cell: ({ row }) => {
      const entry = row.original;
      return <ProjectGrade entry={entry} />;
    },
    meta: {
      className: "max-w-[60px] md:max-w-[100px] xl:max-w-none items-center",
    },
  },
  {
    id: "bonus",
    header: "Coalition Bonus",
    enableHiding: false,
    cell: ({ row }) => {
      const entry = row.original;
      return <ProjectBonus entry={entry} />;
    },
    meta: {
      className: "max-w-[60px] md:max-w-[100px] xl:max-w-none items-center",
    },
  },
  {
    id: "base experience",
    header: "Base Experience",
    cell: ({ row }) => {
      const entry = row.original;
      return <>{entry.project.experience?.toFixed(0) ?? 0}</>;
    },
    meta: {
      visible: false,
      className: "max-w-[120px] xl:max-w-none",
    },
  },
  {
    id: "gained experience",
    header: "Gained Experience",
    cell: ({ row }) => {
      const entry = row.original;
      return <>{entry.experience.toFixed(0)}</>;
    },
    meta: {
      visible: false,
      className: "max-w-[120px] xl:max-w-none",
    },
  },
  {
    id: "level",
    header: "Level",
    cell: ({ row }) => {
      const entry = row.original;
      return <>{entry.level.toFixed(2)}</>;
    },
    meta: {
      className:
        "max-w-[44px] md:max-w-[80px] lg:max-w-none text-right text-clip",
    },
  },
];
