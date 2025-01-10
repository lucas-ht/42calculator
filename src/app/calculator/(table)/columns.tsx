"use client";

import type { FortyTwoProjectCalculator } from "@/types/forty-two";
import type { ColumnDef } from "@tanstack/react-table";
import { ProjectBonus, ProjectGrade, RemoveProject } from "./actions";

export const columns: ColumnDef<FortyTwoProjectCalculator>[] = [
  {
    id: "remove",
    enableHiding: false,
    cell: ({ row }) => {
      const project = row.original;
      return (
        <>
          <RemoveProject project={project} />
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
    accessorKey: "name",
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
      const project = row.original;
      return (
        <>
          <ProjectGrade project={project} />
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
      const project = row.original;
      return (
        <>
          <ProjectBonus project={project} />
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
      const project = row.original;
      return <>{project.experience.base.toFixed(0)}</>;
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
      const project = row.original;
      return <>{project.experience.gained.toFixed(0)}</>;
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
      const project = row.original;
      return <>{project.level.toFixed(2)}</>;
    },
    meta: {
      className:
        "max-w-[44px] md:max-w-[80px] lg:max-w-none text-right text-clip",
    },
  },
];
