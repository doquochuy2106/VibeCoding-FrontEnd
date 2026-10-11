import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Truck,
  ShieldCheck,
  CheckCircle2,
  PackageCheck,
  Copy,
  Printer,
  MapPin,
  CreditCard,
  Clock,
  PhoneCall,
  Sparkles,
  ChevronRight,
  FileText,
} from "lucide-react"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { CartItem } from "@/hooks/use-cart"
import { getAssetUrl } from "@/lib/utils"
import gengLogo from "@/assets/geng-logo.png"

export const LAST_ORDER_STORAGE_KEY = "vibecoding_last_order"

export interface OrderSuccessData {
  orderId?: number
  orderCode: string
  status?: string
  mode: "buy-now" | "cart"
  customerName: string
  customerPhone: string
  customerEmail: string
  fullAddress: string
  note: string
  shippingMethod: "standard" | "express"
  paymentMethod: "cod" | "bank_qr" | "ewallet"
  items: CartItem[]
  subtotal: number
  shippingFee: number
  discountAmount: number
  finalTotal: number
  createdAt: string
}

function formatVND(amount: number | string): string {
  const num = typeof amount === "number" ? amount : Number(amount) || 0
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num)
}

function readLastOrderFromSession(): OrderSuccessData | null {
  try {
    const raw = sessionStorage.getItem(LAST_ORDER_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as OrderSuccessData
  } catch {
    return null
  }
}

export default function OrderSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const [order, setOrder] = useState<OrderSuccessData | null>(() => {
    const stateOrder = (location.state as { order?: OrderSuccessData } | null)
      ?.order
    if (stateOrder) {
      try {
        sessionStorage.setItem(
          LAST_ORDER_STORAGE_KEY,
          JSON.stringify(stateOrder)
        )
      } catch {
        // ignore storage errors
      }
      return stateOrder
    }
    return readLastOrderFromSession()
  })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  useEffect(() => {
    const stateOrder = (location.state as { order?: OrderSuccessData } | null)
      ?.order
    if (stateOrder) {
      setOrder(stateOrder)
      try {
        sessionStorage.setItem(
          LAST_ORDER_STORAGE_KEY,
          JSON.stringify(stateOrder)
        )
      } catch {
        // ignore
      }
    }
  }, [location.state])

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 py-16 px-4 text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PackageCheck className="h-8 w-8" />
          </div>
          <div className="space-y-1 max-w-md">
            <h1 className="text-xl font-bold text-foreground">
              Không tìm thấy thông tin đơn hàng vừa đặt
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Có thể phiên đặt hàng đã kết thúc. Hãy quay lại cửa hàng để khám
              phá các sản phẩm mới nhất nhé!
            </p>
          </div>
          <Link to="/home#products">
            <Button className="gap-2 rounded-xl font-semibold cursor-pointer">
              <ShoppingBag className="h-4 w-4" />
              <span>Quay lại cửa hàng</span>
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const totalItemsCount = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  const timelineSteps = [
    {
      title: "Đặt hàng thành công",
      desc: order.createdAt,
      status: "done" as const,
    },
    {
      title: "Chờ xác nhận & Đóng gói",
      desc: "Dự kiến trong 30 phút",
      status: "current" as const,
    },
    {
      title: "Đang giao hàng",
      desc:
        order.shippingMethod === "express"
          ? "Hỏa tốc 2H nội thành"
          : "Tiêu chuẩn 2 - 4 ngày",
      status: "upcoming" as const,
    },
    {
      title: "Giao hàng hoàn tất",
      desc: "Đồng kiểm & nhận hàng",
      status: "upcoming" as const,
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8 pb-16">
      {/* 1. BREADCRUMB & TOP BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-muted-foreground"
        >
          <Link
            to="/home"
            className="hover:text-primary transition-colors font-medium"
          >
            Trang chủ
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-muted-foreground">Thanh toán</span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="font-bold text-primary">
            Hoàn tất đơn hàng #{order.orderCode}
          </span>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 rounded-xl text-xs cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>In hóa đơn</span>
          </Button>
          <Link to="/orders">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl text-xs font-semibold cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span>Đơn hàng của tôi</span>
            </Button>
          </Link>
          <Link to="/home#products">
            <Button
              size="sm"
              className="gap-1.5 rounded-xl text-xs font-semibold cursor-pointer"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Tiếp tục mua sắm</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. HERO BANNER: ORDER CONFIRMED & TIMELINE STEPPER */}
      <section className="relative overflow-hidden rounded-3xl border border-primary/40 bg-[#09090b] p-6 sm:p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#d4af37]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#d4af37]/50 bg-[#d4af37]/15 text-[#f5d061] shadow-lg">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-[#d4af37] text-[#09090b] font-extrabold text-[11px] border-0">
                  {order.mode === "buy-now"
                    ? "ĐƠN MUA NGAY TRỰC TIẾP"
                    : "ĐƠN HÀNG TỪ GIỎ HÀNG"}
                </Badge>
                <span className="text-xs text-zinc-400">
                  • Đặt lúc {order.createdAt}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Đặt hàng thành công! Cảm ơn{" "}
                <span className="text-[#f5d061]">{order.customerName}</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl">
                Đơn hàng của bạn đã được chuyển tới bộ phận điều phối của{" "}
                <strong>GEN.G Official Store</strong>. Chúng tôi sẽ sớm liên hệ qua
                số điện thoại <strong>{order.customerPhone}</strong> để xác nhận
                giao hàng.
              </p>
            </div>
          </div>

          {/* Order Code Pill */}
          <div className="flex flex-col items-start lg:items-end gap-2 shrink-0 rounded-2xl border border-[#d4af37]/35 bg-white/5 px-5 py-3.5 backdrop-blur-md">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Mã tra cứu đơn hàng
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-extrabold text-[#f5d061]">
                #{order.orderCode}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(order.orderCode)
                  toast.info(`Đã sao chép mã đơn #${order.orderCode}`)
                }}
                className="rounded-lg border border-white/15 bg-white/10 p-1.5 text-zinc-200 hover:bg-[#d4af37] hover:text-[#09090b] transition-colors cursor-pointer"
                title="Sao chép mã đơn hàng"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Order Progress Timeline */}
        <div className="relative z-10 mt-8 grid grid-cols-1 gap-4 border-t border-white/15 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          {timelineSteps.map((step, index) => {
            const isDone = step.status === "done"
            const isCurrent = step.status === "current"
            return (
              <div
                key={step.title}
                className={`flex items-start gap-3 rounded-2xl border p-3.5 transition-colors ${
                  isDone
                    ? "border-[#d4af37]/50 bg-[#d4af37]/15"
                    : isCurrent
                      ? "border-white/25 bg-white/10"
                      : "border-white/10 bg-white/[0.03] opacity-60"
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                    isDone
                      ? "bg-[#d4af37] text-[#09090b]"
                      : isCurrent
                        ? "border-2 border-[#f5d061] text-[#f5d061]"
                        : "border border-zinc-500 text-zinc-400"
                  }`}
                >
                  {isDone ? "✓" : index + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {step.title}
                  </p>
                  <p className="text-[11px] text-zinc-300 truncate mt-0.5">
                    {step.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 3. TWO-COLUMN FULL PAGE DETAILS */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN (7 COLS): DELIVERY, PAYMENT & SUPPORT */}
        <div className="lg:col-span-7 space-y-6">
          {/* Delivery Details Card */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-foreground">
                  Thông tin giao nhận hàng
                </h2>
                <p className="text-xs text-muted-foreground">
                  Địa chỉ và thông tin liên hệ của người nhận
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs sm:text-sm">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">
                  Người nhận hàng:
                </span>
                <p className="font-bold text-foreground">{order.customerName}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">
                  Số điện thoại:
                </span>
                <p className="font-bold text-primary tabular-nums">
                  {order.customerPhone}
                </p>
              </div>

              {order.customerEmail && (
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-xs text-muted-foreground">
                    Email nhận thông báo:
                  </span>
                  <p className="font-medium text-foreground">
                    {order.customerEmail}
                  </p>
                </div>
              )}

              <div className="space-y-1 sm:col-span-2">
                <span className="text-xs text-muted-foreground">
                  Địa chỉ giao hàng:
                </span>
                <p className="font-semibold text-foreground leading-relaxed">
                  {order.fullAddress}
                </p>
              </div>

              {order.note && (
                <div className="space-y-1 sm:col-span-2 rounded-xl border border-border/70 bg-muted/30 p-3">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span>Ghi chú giao hàng:</span>
                  </span>
                  <p className="text-xs text-foreground italic">
                    "{order.note}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment & Shipping Method Card */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-foreground">
                  Phương thức vận chuyển & Thanh toán
                </h2>
                <p className="text-xs text-muted-foreground">
                  Chi tiết hình thức thanh toán bạn đã lựa chọn
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs sm:text-sm">
              <div className="rounded-2xl border border-border/70 bg-background/60 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>Đơn vị vận chuyển</span>
                </div>
                <p className="font-bold text-foreground">
                  {order.shippingMethod === "express"
                    ? "Hỏa tốc Gen.G 2H (Nội thành)"
                    : "Giao hàng Tiêu chuẩn (2 - 4 ngày)"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Phí vận chuyển:{" "}
                  <strong className="text-primary">
                    {order.shippingFee === 0
                      ? "Miễn phí (0₫)"
                      : formatVND(order.shippingFee)}
                  </strong>
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/60 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Hình thức thanh toán</span>
                </div>
                <p className="font-bold text-foreground">
                  {order.paymentMethod === "cod"
                    ? "Thanh toán khi nhận hàng (COD)"
                    : order.paymentMethod === "bank_qr"
                      ? "Chuyển khoản Ngân hàng (VietQR)"
                      : "Ví điện tử MoMo / ZaloPay"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Trạng thái:{" "}
                  <span className="font-semibold text-amber-500">
                    {order.paymentMethod === "cod"
                      ? "Thanh toán khi nhận hàng"
                      : "Đang chờ xác nhận giao dịch"}
                  </span>
                </p>
              </div>
            </div>

            {order.paymentMethod === "bank_qr" && (
              <div className="rounded-2xl border border-primary/35 bg-primary/10 p-4 text-xs space-y-1.5">
                <p className="font-bold text-primary">
                  Hướng dẫn chuyển khoản ngân hàng:
                </p>
                <p className="text-foreground">
                  Ngân hàng: <strong>Vietcombank (VCB)</strong> • Số TK:{" "}
                  <strong className="font-mono text-primary">102688889999</strong>
                </p>
                <p className="text-foreground">
                  Chủ TK: <strong>CONG TY TNHH GENG STORE VIET NAM</strong>
                </p>
                <p className="text-foreground">
                  Số tiền:{" "}
                  <strong className="text-primary tabular-nums">
                    {formatVND(order.finalTotal)}
                  </strong>{" "}
                  • Nội dung CK:{" "}
                  <code className="rounded bg-card px-2 py-0.5 font-mono font-bold text-primary">
                    {order.orderCode}
                  </code>
                </p>
              </div>
            )}
          </div>

          {/* Customer Support Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Cần hỗ trợ thay đổi thông tin đơn hàng?
                </h3>
                <p className="text-xs text-muted-foreground">
                  Liên hệ Hotline CSKH <strong>1900 6868</strong> (8:00 - 22:00)
                  để được hỗ trợ nhanh nhất.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary shrink-0">
              <Clock className="h-4 w-4" />
              <span>Hỗ trợ 24/7</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 COLS): ORDERED ITEMS & RECEIPT SUMMARY */}
        <div className="lg:col-span-5 space-y-6">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/80 bg-[#09090b] px-6 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <img
                  src={gengLogo}
                  alt="Gen.G"
                  className="h-7 w-7 rounded-lg border border-[#d4af37]/40 object-cover"
                />
                <div>
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#f5d061]">
                    Chi tiết hóa đơn
                  </h2>
                  <p className="text-[11px] text-zinc-400">
                    Mã đơn: #{order.orderCode}
                  </p>
                </div>
              </div>
              <Badge className="bg-[#d4af37]/20 text-[#f5d061] border border-[#d4af37]/40 text-xs font-bold tabular-nums">
                {totalItemsCount} sản phẩm
              </Badge>
            </div>

            {/* Product List */}
            <div className="divide-y divide-border/60 px-6 py-2 max-h-[360px] overflow-y-auto">
              {order.items.map(({ product, quantity }) => {
                const unitPrice = Number(product.price) || 0
                const lineTotal = unitPrice * quantity

                return (
                  <div
                    key={product.id}
                    className="flex items-center gap-3.5 py-3.5"
                  >
                    <Link
                      to={`/products/${product.slug}`}
                      className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/30"
                    >
                      {product.imageUrl ? (
                        <img
                          src={getAssetUrl(product.imageUrl)}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <ShoppingBag className="h-5 w-5" />
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <Link
                        to={`/products/${product.slug}`}
                        className="line-clamp-1 text-xs sm:text-sm font-bold text-foreground hover:text-primary transition-colors"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {formatVND(unitPrice)} × <strong>{quantity}</strong>
                      </p>
                    </div>

                    <span className="text-sm font-extrabold text-primary tabular-nums shrink-0">
                      {formatVND(lineTotal)}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Totals Breakdown */}
            <div className="border-t border-border/80 bg-muted/20 px-6 py-5 space-y-3">
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tạm tính ({totalItemsCount} sản phẩm):</span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {formatVND(order.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Phí vận chuyển:</span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {order.shippingFee === 0 ? (
                      <span className="text-primary font-bold">Miễn phí</span>
                    ) : (
                      formatVND(order.shippingFee)
                    )}
                  </span>
                </div>

                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Voucher giảm giá (GENG2026):</span>
                    </span>
                    <span className="font-bold tabular-nums">
                      -{formatVND(order.discountAmount)}
                    </span>
                  </div>
                )}

                <Separator className="my-2" />

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-base font-extrabold text-foreground">
                    Tổng cộng:
                  </span>
                  <span className="text-2xl font-extrabold text-primary tabular-nums">
                    {formatVND(order.finalTotal)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/home")}
                  className="flex-1 h-11 gap-2 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Về trang chủ</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate("/home#products")}
                  className="flex-1 h-11 gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f5d061] to-[#b88917] text-[#09090b] hover:opacity-95 font-extrabold text-xs shadow-lg shadow-[#d4af37]/25 border-0 cursor-pointer"
                >
                  <span>Tiếp tục mua sắm</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
