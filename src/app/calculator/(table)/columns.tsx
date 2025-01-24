"use client";

import type { CalculatorEntry } from "@/types/forty-two";
import type { ColumnDef } from "@tanstack/react-table";
import { ProjectBonus, ProjectGrade, RemoveProject } from "./actions";

export const columns: ColumnDef<CalculatorEntry>[] = [
  {
    id: "remove",
    enableHiding: false,
    cell: ({ row }) => {
      const entry = row.original;
      return (
        <>
          <RemoveProject entry={entry} />
        </>
      );
    },
    meta: {
      className: "w-10 md:w-14 px-0 md:px-2",
    },
  },
  {
    id: "name",
    header: "Name",
    accessorKey: "project.name",
    enableHiding: false,
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
      return (
        <>
          <ProjectGrade entry={entry} />
        </>
      );
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
      return (
        <>
          <ProjectBonus entry={entry} />
        </>
      );
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
