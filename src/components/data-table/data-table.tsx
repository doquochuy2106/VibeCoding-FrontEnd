import * as React from "react"
import {
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type OnChangeFn,
  type PaginationState,
  type ReactTable,
  type RowData,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table"

import {
  Table as UiTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { features, type DataTableFeatures } from "./data-table-features"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTablePagination } from "./data-table-pagination"

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[]
  data: TData[]
  /** Column id to drive the free-text search box in the toolbar. */
  searchColumnId?: string
  searchPlaceholder?: string
  /** Controlled search value and change callback for server-side search */
  searchValue?: string
  onSearchChange?: (value: string) => void
  /** Extra filter controls (selects, facets, ...) rendered next to the search box. */
  filters?: (table: ReactTable<DataTableFeatures, TData>) => React.ReactNode
  enableRowSelection?: boolean
  pageSize?: number
  pageSizeOptions?: number[]
  loading?: boolean
  loadingMessage?: string
  emptyMessage?: string
  /**
   * Enables server-side pagination. When provided, `data` is expected to
   * already contain just the current page's rows, and `pagination` /
   * `onPaginationChange` / `pageCount` take over from client-side paging.
   */
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  pageCount?: number
  rowCount?: number
  /** Controlled sorting state and change callback for server-side sorting */
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  searchColumnId,
  searchPlaceholder = "Tìm kiếm...",
  searchValue,
  onSearchChange,
  filters,
  enableRowSelection = false,
  pageSize = 10,
  pageSizeOptions,
  loading = false,
  emptyMessage = "Không có dữ liệu.",
  pagination,
  onPaginationChange,
  pageCount,
  rowCount,
  sorting,
  onSortingChange,
}: DataTableProps<TData>) {
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([])
  const isSortingControlled = sorting !== undefined
  const activeSorting = isSortingControlled ? sorting : internalSorting
  const handleSortingChange = isSortingControlled ? onSortingChange : setInternalSorting

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [internalPagination, setInternalPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })

  const manualPagination = pagination !== undefined

  const table = useTable({
    features,
    data,
    columns,
    enableRowSelection,
    manualPagination,
    pageCount: manualPagination ? pageCount : undefined,
    rowCount: manualPagination ? rowCount : undefined,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: manualPagination ? onPaginationChange : setInternalPagination,
    initialState: {
      pagination: { pageSize, pageIndex: 0 },
    },
    state: {
      sorting: activeSorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: manualPagination ? pagination : internalPagination,
    },
  })

  const searchColumn = searchColumnId ? table.getColumn(searchColumnId) : undefined
  const visibleColumns = table.getVisibleLeafColumns()
  const skeletonRowCount = Math.min(
    (manualPagination ? pagination?.pageSize : internalPagination.pageSize) || 8,
    10
  )

  return (
    <div className="flex flex-col gap-4">
      {(searchColumn || onSearchChange || filters) && (
        <div className="flex flex-wrap items-center gap-2">
          {onSearchChange ? (
            <Input
              placeholder={searchPlaceholder}
              value={searchValue ?? ""}
              onChange={(event) => onSearchChange(event.target.value)}
              className="h-8 max-w-sm"
            />
          ) : searchColumn ? (
            <Input
              placeholder={searchPlaceholder}
              value={(searchColumn.getFilterValue() as string) ?? ""}
              onChange={(event) => searchColumn.setFilterValue(event.target.value)}
              className="h-8 max-w-sm"
            />
          ) : null}
          {filters?.(table)}
          <DataTableViewOptions table={table} />
        </div>
      )}

      <div className="overflow-hidden rounded-md border">
        <UiTable>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: skeletonRowCount }).map((_, rowIdx) => (
                <TableRow key={`skeleton-row-${rowIdx}`}>
                  {(visibleColumns.length > 0
                    ? visibleColumns
                    : columns.map((c, idx) => ({ id: c.id ?? String(idx) }))
                  ).map((col, colIdx) => {
                    const colId = String(col.id || "").toLowerCase()
                    return (
                      <TableCell key={`skeleton-cell-${rowIdx}-${colIdx}`}>
                        {colId === "id" ? (
                          <Skeleton className="h-4 w-9 rounded" />
                        ) : colId === "name" ? (
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
                            <div className="space-y-1.5">
                              <Skeleton className="h-4 w-32 sm:w-40 rounded" />
                              <Skeleton className="h-3 w-20 sm:w-24 rounded" />
                            </div>
                          </div>
                        ) : colId === "actions" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                          </div>
                        ) : colId.includes("role") ||
                          colId.includes("active") ||
                          colId.includes("count") ||
                          colId.includes("category") ||
                          colId.includes("status") ? (
                          <Skeleton className="h-5 w-24 rounded-full" />
                        ) : colId.includes("price") ||
                          colId.includes("quantity") ? (
                          <Skeleton className="h-4 w-20 rounded" />
                        ) : (
                          <Skeleton className="h-4 w-28 sm:w-36 rounded" />
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </UiTable>
      </div>

      <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
    </div>
  )
}
