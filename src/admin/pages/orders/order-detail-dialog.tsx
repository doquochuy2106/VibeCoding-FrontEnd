import { useState } from "react"
import {
  EyeIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  PackageIcon,
  ShoppingBagIcon,
  Loader2Icon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  ORDER_STATUS_CONFIG,
  type Order,
  type OrderStatus,
} from "@/services/orders.service"
import { getAssetUrl } from "@/lib/utils"

function formatCurrency(amount: number | string): string {
  const num = typeof amount === "number" ? amount : Number(amount) || 0
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num)
}

export function OrderDetailDialog({
  order,
  onStatusChange,
}: {
  order: Order
  onStatusChange: (id: number, status: OrderStatus) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const statusConfig =
    ORDER_STATUS_CONFIG[order.status] ?? ORDER_STATUS_CONFIG.PENDING

  const totalQuantity =
    order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  const handleStatusSelect = async (nextStatus: string | null) => {
    if (!nextStatus || nextStatus === order.status) return
    setUpdatingStatus(true)
    try {
      await onStatusChange(order.id, nextStatus as OrderStatus)
    } finally {
      setUpdatingStatus(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Xem chi tiết đơn hàng"
            title="Xem chi tiết đơn hàng"
          >
            <EyeIcon className="h-4 w-4 text-primary" />
          </Button>
        }
      />

      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border">
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <div>
              <DialogTitle className="flex items-center gap-2.5 text-lg font-bold">
                <span>Chi tiết đơn hàng #{order.id}</span>
                <Badge
                  variant={statusConfig.badgeVariant}
                  className={statusConfig.className}
                >
                  {statusConfig.label}
                </Badge>
              </DialogTitle>
              <DialogDescription className="mt-1 flex items-center gap-1.5 text-xs">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>
                  Đặt lúc:{" "}
                  {new Date(order.createdAt).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Cập nhật trạng thái đơn hàng */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 p-3.5">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-foreground">
                Trạng thái xử lý đơn hàng
              </p>
              <p className="text-[11px] text-muted-foreground">
                Khi chuyển sang &ldquo;Đã hủy&rdquo;, hệ thống sẽ tự động hoàn lại tồn kho sản phẩm.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {updatingStatus && (
                <Loader2Icon className="h-4 w-4 animate-spin text-primary" />
              )}
              <Select
                value={order.status}
                onValueChange={handleStatusSelect}
                disabled={updatingStatus}
              >
                <SelectTrigger size="sm" className="w-[175px] bg-background">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                  <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                  <SelectItem value="SHIPPED">Đang giao hàng</SelectItem>
                  <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                  <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Thông tin khách hàng & giao hàng */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Thông tin người nhận
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
              <div className="flex items-start gap-2.5">
                <UserIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Họ và tên</p>
                  <p className="font-semibold text-foreground">
                    {order.customerName}
                  </p>
                  {order.user?.email ? (
                    <p className="text-[11px] text-muted-foreground">
                      Tài khoản: {order.user.email}
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      Khách vãng lai
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <PhoneIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Số điện thoại</p>
                  <p className="font-mono font-semibold text-foreground">
                    {order.customerPhone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 sm:col-span-2">
                <MapPinIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Địa chỉ giao hàng
                  </p>
                  <p className="font-medium text-foreground">
                    {order.shippingAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Danh sách sản phẩm trong đơn hàng */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ShoppingBagIcon className="h-3.5 w-3.5 text-primary" />
                <span>
                  Danh sách sản phẩm ({order.items?.length ?? 0} mặt hàng -{" "}
                  {totalQuantity} sản phẩm)
                </span>
              </h4>
            </div>

            <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
              {order.items && order.items.length > 0 ? (
                order.items.map((item) => {
                  const lineTotal = (Number(item.price) || 0) * item.quantity
                  const productName =
                    item.product?.name || `Sản phẩm #${item.productId}`
                  const imageUrl = item.product?.imageUrl

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3.5 p-3.5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                          {imageUrl ? (
                            <img
                              src={getAssetUrl(imageUrl)}
                              alt={productName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <PackageIcon className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {productName}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>Đơn giá: {formatCurrency(item.price)}</span>
                            <span>•</span>
                            <span className="font-semibold text-foreground">
                              SL: x{item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono text-sm font-bold text-primary tabular-nums">
                          {formatCurrency(lineTotal)}
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  Không có dữ liệu chi tiết sản phẩm.
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Tổng thanh toán */}
          <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 px-4 py-3">
            <span className="text-sm font-bold text-foreground">
              Tổng tiền đơn hàng
            </span>
            <span className="font-mono text-lg font-extrabold text-primary tabular-nums">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>

        <DialogFooter className="px-6 py-3.5 border-t border-border bg-muted/20">
          <DialogClose
            render={
              <Button type="button" variant="outline">
                Đóng
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
