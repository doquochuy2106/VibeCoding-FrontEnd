import type * as React from "react"
import type { Column, RowData, SortingState } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { DataTableFeatures } from "./data-table-features"

interface DataTableColumnHeaderProps<TData extends RowData>
  extends React.HTMLAttributes<HTMLDivElement> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  column: Column<DataTableFeatures, TData, any>
  title: string
}

export function DataTableColumnHeader<TData extends RowData>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  // Đọc trạng thái sắp xếp trực tiếp từ controlled state nếu có, đảm bảo đồng bộ 100% với React state
  const sortingState = (
    column.table.options.state as { sorting?: SortingState } | undefined
  )?.sorting
  const currentSort = sortingState?.find((s) => s.id === column.id)
  const sorted: false | "asc" | "desc" = currentSort
    ? currentSort.desc
      ? "desc"
      : "asc"
    : column.getIsSorted()

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("-ml-2 h-8 data-[state=open]:bg-accent", className)}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      <span>{title}</span>
      {sorted === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : sorted === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : (
        <ChevronsUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  )
}
