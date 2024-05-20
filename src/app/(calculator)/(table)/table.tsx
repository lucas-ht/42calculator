'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useBreakpoint } from '@/lib/breakpoint'
import { useCalculatorStore } from '@/providers/calculator-store-provider'
import {
  Column as ColumnInstance,
  Table as TableInstance,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import { Ellipsis } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { columns } from './columns'

function ColumnVisibility<TData>({
  columns
}: {
  columns: ColumnInstance<TData>[]
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
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
  )
}

function CalculatorHeader<TData>({
  table,
  levelStart
}: {
  table: TableInstance<TData>
  levelStart: number
}) {
  return (
    <>
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead
            colSpan={table.getVisibleFlatColumns().length - 1}
            className="text-inherit"
          >
            Start level
          </TableHead>
          <TableHead className="text-right font-semibold text-inherit">
            {levelStart.toFixed(2)}
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
                  className={header.column.columnDef.meta?.className}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
    </>
  )
}

function CalculatorBody<TData>({ table }: { table: TableInstance<TData> }) {
  return (
    <TableBody>
      {table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                className={cell.column.columnDef.meta?.className}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))
      ) : (
        <TableRow className="hover:bg-inherit">
          <TableCell colSpan={columns.length} className="h-24 text-center">
            Add a project to get started.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  )
}

function CalculatorFooter<TData>({
  table,
  levelEnd
}: {
  table: TableInstance<TData>
  levelEnd: number
}) {
  return (
    <TableFooter>
      <TableRow>
        <TableCell colSpan={table.getVisibleFlatColumns().length - 1}>
          End level
        </TableCell>
        <TableCell className="text-right font-semibold">
          {levelEnd.toFixed(2)}
        </TableCell>
      </TableRow>
    </TableFooter>
  )
}

export function CalculatorTable() {
  const { projects, level } = useCalculatorStore((state) => state)
  const data = useMemo(() => Object.values(projects), [projects])

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    columns.reduce((acc, column) => {
      if (column.id != undefined) {
        acc[column.id] = column.meta?.visible ?? true
      }

      return acc
    }, {} as VisibilityState)
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility
    }
  })

  // This is necessary because of the table width calculation
  const { isAboveLg } = useBreakpoint('lg')

  useEffect(() => {
    if (isAboveLg) {
      return
    }

    for (const column of table.getAllColumns()) {
      if (column.getCanHide()) {
        column.toggleVisibility(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAboveLg])

  return (
    <>
      <div className="-mt-12 hidden h-12 justify-end pb-1 lg:flex">
        <ColumnVisibility
          columns={table.getAllColumns().filter((col) => col.getCanHide())}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <CalculatorHeader table={table} levelStart={level} />
          <CalculatorBody table={table} />
          <CalculatorFooter table={table} levelEnd={level} />
        </Table>
      </div>
    </>
  )
}

export default CalculatorTable
