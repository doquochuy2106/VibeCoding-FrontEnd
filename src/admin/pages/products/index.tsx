import { useMemo } from "react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/data-table"
import { createProductColumns } from "./columns"
import { useProducts } from "./use-products"
import { CreateProductDialog } from "./create-product-dialog"

export default function ProductsPage() {
  const {
    products,
    total,
    pageCount,
    pagination,
    setPagination,
    sorting,
    setSorting,
    isActive,
    setIsActive,
    search,
    setSearch,
    loading,
    refetch,
    deleteProduct,
  } = useProducts()

  const columns = useMemo(
    () =>
      createProductColumns({
        onDelete: deleteProduct,
        onEditSuccess: refetch,
      }),
    [deleteProduct, refetch]
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sản phẩm</h1>
        <CreateProductDialog onSuccess={refetch} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách sản phẩm ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={products}
            loading={loading}
            pagination={pagination}
            onPaginationChange={setPagination}
            sorting={sorting}
            onSortingChange={setSorting}
            pageCount={pageCount}
            rowCount={total}
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Tìm theo tên sản phẩm, slug..."
            filters={() => (
              <Select value={isActive} onValueChange={setIsActive}>
                <SelectTrigger size="sm" className="w-[180px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="true">Đang kinh doanh</SelectItem>
                  <SelectItem value="false">Tạm ẩn (Ngừng bán)</SelectItem>
                </SelectContent>
              </Select>
            )}
            emptyMessage="Không có sản phẩm nào"
          />
        </CardContent>
      </Card>
    </div>
  )
}
