import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import {
  ShoppingBag,
  Package,
  Calendar,
  MapPin,
  Phone,
  User,
  RefreshCw,
  ChevronRight,
  XCircle,
  Loader2,
  ClipboardList,
} from "lucide-react"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { PopConfirm } from "@/components/ui/pop-confirm"
import {
  ordersService,
  ORDER_STATUS_CONFIG,
  type Order,
  type OrderStatus,
} from "@/services/orders.service"
import { useAuth } from "@/hooks/use-auth"
import { ApiError } from "@/lib/http-client"
import { getAssetUrl } from "@/lib/utils"

function formatVND(amount: number | string): string {
  const num = typeof amount === "number" ? amount : Number(amount) || 0
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num)
}

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "SHIPPED", label: "Đang giao hàng" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
]

export default function ClientOrdersPage() {
  const { isAuthenticated } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  const fetchMyOrders = useCallback(
    async (signal?: AbortSignal) => {
      if (!isAuthenticated) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const res = await ordersService.myOrders(
          {
            page: 1,
            limit: 50,
            status: statusFilter !== "all" ? statusFilter : undefined,
            sortBy: "createdAt",
            sortOrder: "desc",
          },
          signal
        )
        if (!signal?.aborted) {
          setOrders(res.data ?? [])
        }
      } catch (err) {
        if (!signal?.aborted) {
          const message =
            err instanceof ApiError
              ? err.message
              : "Không thể tải danh sách đơn hàng."
          toast.error(message)
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false)
        }
      }
    },
    [isAuthenticated, statusFilter]
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchMyOrders(controller.signal)
    return () => controller.abort()
  }, [fetchMyOrders])

  const handleCancelOrder = async (orderId: number) => {
    setCancellingId(orderId)
    try {
      await ordersService.updateStatus(orderId, "CANCELLED" as OrderStatus)
      toast.success(
        `Đã hủy đơn hàng #${orderId}. Số lượng tồn kho đã được hoàn lại.`
      )
      fetchMyOrders()
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Không thể hủy đơn hàng, vui lòng thử lại."
      toast.error(message)
    } finally {
      setCancellingId(null)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="border-dashed border-border bg-card/60 py-14">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ClipboardList className="h-8 w-8" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h1 className="text-xl font-bold text-foreground">
                Vui lòng đăng nhập để xem đơn hàng của bạn
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Đăng nhập tài khoản để theo dõi trạng thái xử lý và lịch sử các đơn hàng đã đặt.
              </p>
            </div>
            <Link to="/login">
              <Button className="rounded-xl px-6 font-bold cursor-pointer">
                Đăng nhập ngay
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-6 pb-16">
      {/* Breadcrumb & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/home" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground">
              Đơn hàng của tôi
            </span>
          </nav>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Lịch sử đơn hàng
          </h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchMyOrders()}
          disabled={loading}
          className="gap-2 rounded-xl cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>Làm mới</span>
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => {
          const active = statusFilter === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx} className="rounded-2xl border-border bg-card">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-40 rounded" />
                  <Skeleton className="h-6 w-28 rounded-full" />
                </div>
                <Skeleton className="h-16 w-full rounded-xl" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-48 rounded" />
                  <Skeleton className="h-6 w-32 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="border-dashed border-border bg-card/60 py-14 rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <div className="space-y-1 max-w-md">
              <p className="text-base font-bold text-foreground">
                Chưa có đơn hàng nào
              </p>
              <p className="text-xs text-muted-foreground">
                Bạn chưa có đơn hàng nào ở trạng thái này. Hãy khám phá các sản phẩm trong cửa hàng nhé!
              </p>
            </div>
            <Link to="/home#products">
              <Button className="rounded-xl px-5 font-semibold cursor-pointer">
                Tiếp tục mua sắm
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig =
              ORDER_STATUS_CONFIG[order.status] ?? ORDER_STATUS_CONFIG.PENDING
            const orderCode = `GENG-${String(order.id).padStart(6, "0")}`

            return (
              <Card
                key={order.id}
                className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all hover:border-primary/40"
              >
                <CardContent className="p-0">
                  {/* Top Order Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-muted/25 px-5 py-3.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-sm font-extrabold text-primary">
                        #{orderCode}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(order.createdAt).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <Badge
                      variant={statusConfig.badgeVariant}
                      className={statusConfig.className}
                    >
                      {statusConfig.label}
                    </Badge>
                  </div>

                  {/* Order Items */}
                  <div className="divide-y divide-border/60 px-5 py-3">
                    {order.items?.map((item) => {
                      const productName =
                        item.product?.name || `Sản phẩm #${item.productId}`
                      const slug = item.product?.slug
                      const imageUrl = item.product?.imageUrl

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4 py-3"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/30 flex items-center justify-center">
                              {imageUrl ? (
                                <img
                                  src={getAssetUrl(imageUrl)}
                                  alt={productName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>

                            <div className="min-w-0 space-y-1">
                              {slug ? (
                                <Link
                                  to={`/products/${slug}`}
                                  className="line-clamp-1 text-sm font-bold text-foreground hover:text-primary transition-colors"
                                >
                                  {productName}
                                </Link>
                              ) : (
                                <p className="line-clamp-1 text-sm font-bold text-foreground">
                                  {productName}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Đơn giá: {formatVND(item.price)}</span>
                                <span>•</span>
                                <span className="font-semibold text-foreground">
                                  x{item.quantity}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono text-sm font-bold text-foreground tabular-nums">
                              {formatVND(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <Separator />

                  {/* Order Footer: Shipping Info + Total + Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/15 px-5 py-3.5">
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                        <User className="h-3.5 w-3.5 text-primary" />
                        {order.customerName}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-mono">
                        <Phone className="h-3.5 w-3.5 text-primary" />
                        {order.customerPhone}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate max-w-xs sm:max-w-md">
                          {order.shippingAddress}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground mr-2">
                          Tổng thanh toán:
                        </span>
                        <span className="font-mono text-base font-extrabold text-primary tabular-nums">
                          {formatVND(order.totalAmount)}
                        </span>
                      </div>

                      {order.status === "PENDING" && (
                        <PopConfirm
                          title="Hủy đơn hàng này?"
                          description={`Bạn có chắc muốn hủy đơn hàng #${orderCode}?`}
                          confirmText="Xác nhận hủy"
                          onConfirm={() => handleCancelOrder(order.id)}
                        >
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={cancellingId === order.id}
                            className="gap-1.5 rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 text-xs cursor-pointer"
                          >
                            {cancellingId === order.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}
                            <span>Hủy đơn</span>
                          </Button>
                        </PopConfirm>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
