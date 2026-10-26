import { act, renderHook } from "@testing-library/react";
import { useTable } from "@tanstack/react-table";
import { calculatorFeatures } from "@/app/calculator/table-config";

it("keeps expansion and column visibility working with Table v9", () => {
  const data = [{ id: "parent", children: [{ id: "child", children: [] }] }];
  const { result } = renderHook(() => useTable({
    features: calculatorFeatures,
    columns: [{ accessorKey: "id" }],
    data,
    getSubRows: (row) => row.children,
  }));
  expect(result.current.getRowModel().rows).toHaveLength(1);
  act(() => result.current.getRowModel().rows[0].toggleExpanded());
  expect(result.current.getRowModel().rows).toHaveLength(2);
  act(() => result.current.getColumn("id")!.toggleVisibility(false));
  expect(result.current.getVisibleFlatColumns()).toHaveLength(0);
});

it("keeps module rows expanded when an edit replaces the table data", () => {
  const data = [{ id: "parent", children: [{ id: "child", children: [] }] }];
  const { result, rerender } = renderHook(({ rows }) => useTable({
    features: calculatorFeatures, columns: [{ accessorKey: "id" }], data: rows,
    getSubRows: (row) => row.children, autoResetExpanded: false,
  }), { initialProps: { rows: data } });
  act(() => result.current.getRowModel().rows[0].toggleExpanded());
  rerender({ rows: [{ ...data[0], children: [{ id: "edited child", children: [] }] }] });
  expect(result.current.getRowModel().rows).toHaveLength(2);
});
