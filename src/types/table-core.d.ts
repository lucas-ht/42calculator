// biome-ignore lint: This file is a declaration file and does not need to be linted for dependencies
import "@tanstack/table-core";

declare module "@tanstack/table-core" {
  interface ColumnMeta<TData, TValue> {
    className?: string;
    visible?: boolean;
  }

  // biome-ignore lint: This file is a declaration file and does not need to be linted for dependencies
  interface TableMeta<TData extends RowData> {
    className?: string;
  }
}
