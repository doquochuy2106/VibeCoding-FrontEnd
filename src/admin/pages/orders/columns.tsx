import { useState } from "react"
import { createColumnHelper } from "@tanstack/react-table"
import { Trash2Icon, PackageIcon, Loader2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PopConfirm } from "@/components/ui/pop-confirm"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DataTableColumnHeader,
  type DataTableFeatures,
} from "@/components/data-table"
import {
  ORDER_STATUS_CONFIG,
  type Order,
  type OrderStatus,
} from "@/services/orders.service"
import { getAssetUrl } from "@/lib/utils"
import { OrderDetailDialog } from "./order-detail-dialog"
import { EditOrderDialog } from "./edit-order-dialog"

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "number" ? amount : Number(amount) || 0
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num)
}

const columnHelper = createColumnHelper<DataTableFeatures, Order>()

function OrderStatusSelectCell({
  order,
  onStatusChange,
}: {
  order: Order
  onStatusChange: (id: number, status: OrderStatus) => Promise<void>
}) {
  const [updating, setUpdating] = useState(false)
  const config =
    ORDER_STATUS_CONFIG[order.status] ?? ORDER_STATUS_CONFIG.PENDING

  const handleSelect = async (nextVal: string | null) => {
    if (!nextVal || nextVal === order.status) return
    setUpdating(true)
    try {
      await onStatusChange(order.id, nextVal as OrderStatus)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <Select
        value={order.status}
        onValueChange={handleSelect}
        disabled={updating}
      >
        <SelectTrigger
          size="sm"
          className={`h-7 min-w-[140px] rounded-full px-2.5 text-xs font-semibold border ${config.className}`}
        >
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
          <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
          <SelectItem value="SHIPPED">Đang giao hàng</SelectItem>
          <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
          <SelectItem value="CANCELLED">Đã hủy</SelectItem>
        </SelectContent>
      </Select>
      {updating && (
        <Loader2Icon className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
      )}
    </div>
  )
}

function DeleteOrderButton({
  order,
  onDelete,
}: {
  order: Order
  onDelete: (id: number) => Promise<void>
}) {
  return (
    <PopConfirm
      title="Xóa đơn hàng?"
      description={`Bạn có chắc muốn xóa đơn hàng #${order.id} của khách hàng "${order.customerName}"? Nếu đơn chưa hoàn thành hoặc chưa hủy, tồn kho sản phẩm sẽ được hoàn trả tự động.`}
      confirmText="Xóa đơn hàng"
      onConfirm={() => onDelete(order.id)}
    >
      <Button
        variant="ghost"
        size="icon"
        aria-label="Xóa đơn hàng"
        title="Xóa đơn hàng"
      >
        <Trash2Icon className="h-4 w-4 text-destructive" />
      </Button>
    </PopConfirm>
  )
}

interface OrderColumnActions {
  onDelete: (id: number) => Promise<void>
  onStatusChange: (id: number, status: OrderStatus) => Promise<void>
  onEditSuccess: () => void
}

export function createOrderColumns({
  onDelete,
  onStatusChange,
  onEditSuccess,
}: OrderColumnActions) {
  return columnHelper.columns([
    columnHelper.accessor("id", {
      id: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mã đơn" />
      ),
      sortFn: "alphanumeric",
      meta: { label: "Mã đơn" },
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="font-mono text-xs font-bold text-primary border-primary/30 bg-primary/5"
        >
          #{row.original.id}
        </Badge>
      ),
    }),
    columnHelper.accessor("customerName", {
      id: "customerName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Khách hàng" />
      ),
      sortFn: "text",
      meta: { label: "Khách hàng" },
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="flex flex-col min-w-0 max-w-[190px]">
            <span
              className="truncate font-semibold text-foreground"
              title={order.customerName}
            >
              {order.customerName}
            </span>
            <span className="truncate font-mono text-xs text-muted-foreground">
              {order.customerPhone}
            </span>
          </div>
        )
      },
    }),
    columnHelper.accessor("shippingAddress", {
      id: "shippingAddress",
      header: "Địa chỉ nhận hàng",
      meta: { label: "Địa chỉ nhận hàng" },
      cell: ({ row }) => (
        <span
          className="block max-w-[220px] truncate text-xs text-muted-foreground"
          title={row.original.shippingAddress}
        >
          {row.original.shippingAddress}
        </span>
      ),
    }),
    columnHelper.display({
      id: "items",
      header: "Sản phẩm đặt mua",
      meta: { label: "Sản phẩm đặt mua" },
      cell: ({ row }) => {
        const items = row.original.items ?? []
        const totalQty = items.reduce((sum, item) => sum + item.quantity, 0)
        const firstItem = items[0]
        const firstProductName =
          firstItem?.product?.name ||
          (firstItem ? `Sản phẩm #${firstItem.productId}` : "—")

        return (
          <div className="flex items-center gap-2.5 min-w-0 max-w-[230px]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
              {firstItem?.product?.imageUrl ? (
                <img
                  src={getAssetUrl(firstItem.product.imageUrl)}
                  alt={firstProductName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <PackageIcon className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className="truncate text-xs font-medium text-foreground"
                title={firstProductName}
              >
                {firstProductName}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {items.length > 1
                  ? `+${items.length - 1} mặt hàng khác (Tổng: ${totalQty} SP)`
                  : `Số lượng: x${totalQty}`}
              </span>
            </div>
          </div>
        )
      },
    }),
    columnHelper.accessor("totalAmount", {
      id: "totalAmount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tổng tiền" />
      ),
      sortFn: "alphanumeric",
      meta: { label: "Tổng tiền" },
      cell: ({ getValue }) => (
        <span className="font-mono font-bold tabular-nums text-foreground">
          {formatCurrency(getValue())}
        </span>
      ),
    }),
    columnHelper.accessor("status", {
      id: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Trạng thái" />
      ),
      sortFn: "alphanumeric",
      meta: { label: "Trạng thái" },
      cell: ({ row }) => (
        <OrderStatusSelectCell
          order={row.original}
          onStatusChange={onStatusChange}
        />
      ),
    }),
    columnHelper.accessor("createdAt", {
      id: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ngày đặt" />
      ),
      sortFn: "datetime",
      meta: { label: "Ngày đặt" },
      cell: ({ getValue }) =>
        new Date(getValue()).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      meta: { label: "Thao tác" },
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <OrderDetailDialog
            order={row.original}
            onStatusChange={onStatusChange}
          />
          <EditOrderDialog order={row.original} onSuccess={onEditSuccess} />
          <DeleteOrderButton order={row.original} onDelete={onDelete} />
        </div>
      ),
    }),
  ])
}
