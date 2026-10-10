import { useMemo } from "react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTable } from "@/components/data-table"
import { createCategoryColumns } from "./columns"
import { useCategories } from "./use-categories"
import { CreateCategoryDialog } from "./create-category-dialog"

export default function CategoriesPage() {
  const {
    categories,
    total,
    pageCount,
    pagination,
    setPagination,
    sorting,
    setSorting,
    search,
    setSearch,
    loading,
    refetch,
    deleteCategory,
  } = useCategories()

  const columns = useMemo(
    () =>
      createCategoryColumns({
        onDelete: deleteCategory,
        onEditSuccess: refetch,
      }),
    [deleteCategory, refetch]
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Danh mục sản phẩm</h1>
        <CreateCategoryDialog onSuccess={refetch} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Danh sách danh mục</span>
            {loading ? (
              <Skeleton className="h-5 w-10 rounded-md" />
            ) : (
              <span className="text-muted-foreground font-mono text-sm">
                ({total})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={categories}
            loading={loading}
            pagination={pagination}
            onPaginationChange={setPagination}
            sorting={sorting}
            onSortingChange={setSorting}
            pageCount={pageCount}
            rowCount={total}
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Tìm theo tên danh mục, slug, mô tả..."
            emptyMessage="Không có danh mục nào"
          />
        </CardContent>
      </Card>
    </div>
  )
}
