import { useMemo } from "react"
import { RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { Skeleton } from "@/components/ui/skeleton"
import { DataTable } from "@/components/data-table"
import { createOrderColumns } from "./columns"
import { useOrders } from "./use-orders"

export default function OrdersPage() {
  const {
    orders,
    total,
    pageCount,
    pagination,
    setPagination,
    sorting,
    setSorting,
    status,
    setStatus,
    search,
    setSearch,
    loading,
    refetch,
    updateOrderStatus,
    deleteOrder,
  } = useOrders()

  const columns = useMemo(
    () =>
      createOrderColumns({
        onDelete: deleteOrder,
        onStatusChange: updateOrderStatus,
        onEditSuccess: refetch,
      }),
    [deleteOrder, updateOrderStatus, refetch]
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Đơn hàng</h1>
          <p className="text-xs text-muted-foreground">
            Đơn hàng phát sinh từ hệ thống đặt hàng của khách — Chỉ xem chi tiết, cập nhật trạng thái và xóa đơn hàng
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          disabled={loading}
          className="gap-2 cursor-pointer"
        >
          <RefreshCwIcon
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          <span>Làm mới</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Danh sách đơn hàng</span>
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
            data={orders}
            loading={loading}
            pagination={pagination}
            onPaginationChange={setPagination}
            sorting={sorting}
            onSortingChange={setSorting}
            pageCount={pageCount}
            rowCount={total}
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Tìm theo mã đơn, tên khách hàng, SĐT, địa chỉ..."
            filters={() => (
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger size="sm" className="w-[185px]">
                  <SelectValue placeholder="Trạng thái đơn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                  <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                  <SelectItem value="SHIPPED">Đang giao hàng</SelectItem>
                  <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                  <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            )}
            emptyMessage="Chưa có đơn hàng nào được đặt"
          />
        </CardContent>
      </Card>
    </div>
  )
}
