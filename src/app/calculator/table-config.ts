import {
  type Column,
  type ColumnDef,
  columnVisibilityFeature,
  createExpandedRowModel,
  type Row,
  type RowData,
  rowExpandingFeature,
  type Table,
  tableFeatures,
} from "@tanstack/react-table";

export const calculatorFeatures = tableFeatures({
  columnVisibilityFeature,
  rowExpandingFeature,
  expandedRowModel: createExpandedRowModel(),
  tableMeta: {} as { className?: string },
  columnMeta: {} as { className?: string; visible?: boolean },
});

type Features = typeof calculatorFeatures;
export type CalculatorTable<TData extends RowData> = Table<Features, TData>;
export type CalculatorRow<TData extends RowData> = Row<Features, TData>;
export type CalculatorColumn<TData extends RowData> = Column<Features, TData>;
export type CalculatorColumnDef<TData extends RowData> = ColumnDef<
  Features,
  TData
>;
