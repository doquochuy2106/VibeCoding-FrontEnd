import { useState, useEffect, useMemo } from "react"
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import {
  ShoppingBag,
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
  Truck,
  ShieldCheck,
  CreditCard,
  Banknote,
  QrCode,
  Wallet,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  Tag,
  Sparkles,
  CheckCircle2,
  Plus,
  Minus,
  Trash2,
  Zap,
  Clock,
} from "lucide-react"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { useCart, type CartItem } from "@/hooks/use-cart"
import { ordersService } from "@/services/orders.service"
import { ApiError } from "@/lib/http-client"
import { getAssetUrl } from "@/lib/utils"
import gengLogo from "@/assets/geng-logo.png"
import {
  LAST_ORDER_STORAGE_KEY,
  type OrderSuccessData,
} from "./order-success"

export const BUY_NOW_STORAGE_KEY = "vibecoding_buy_now_item"
const FREE_SHIPPING_THRESHOLD = 299000

export interface CheckoutLocationState {
  mode?: "buy-now" | "cart"
  buyNowItem?: CartItem
  voucher?: string | null
}

type ShippingMethodType = "standard" | "express"
type PaymentMethodType = "cod" | "bank_qr" | "ewallet"

function formatVND(amount: number | string): string {
  const num = typeof amount === "number" ? amount : Number(amount) || 0
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num)
}

function readBuyNowFromSession(): CartItem | null {
  try {
    const raw = sessionStorage.getItem(BUY_NOW_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && parsed.product && typeof parsed.quantity === "number") {
      return parsed as CartItem
    }
    return null
  } catch {
    return null
  }
}

const PROVINCES = [
  "TP. Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Cần Thơ",
  "Hải Phòng",
  "Bình Dương",
  "Đồng Nai",
  "Khánh Hòa",
  "Tỉnh / Thành phố khác",
]

export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const {
    items: cartItems,
    updateQuantity: updateCartQty,
    removeItem: removeCartItem,
    clearCart,
  } = useCart()

  const navState = (location.state as CheckoutLocationState | null) || null

  // Determine checkout mode: "buy-now" (from Product Detail) vs "cart" (from Shopping Cart)
  const initialMode: "buy-now" | "cart" =
    navState?.mode === "buy-now" || searchParams.get("mode") === "buy-now"
      ? "buy-now"
      : "cart"

  const [checkoutMode, setCheckoutMode] = useState<"buy-now" | "cart">(
    initialMode
  )

  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(() => {
    if (navState?.buyNowItem) {
      try {
        sessionStorage.setItem(
          BUY_NOW_STORAGE_KEY,
          JSON.stringify(navState.buyNowItem)
        )
      } catch {
        // ignore storage errors
      }
      return navState.buyNowItem
    }
    return readBuyNowFromSession()
  })

  // Sync if location.state changes (e.g., user clicks Cart -> Thanh toán ngay while already on /checkout)
  useEffect(() => {
    const state = (location.state as CheckoutLocationState | null) || null
    if (state?.mode === "buy-now" && state.buyNowItem) {
      setCheckoutMode("buy-now")
      setBuyNowItem(state.buyNowItem)
      try {
        sessionStorage.setItem(
          BUY_NOW_STORAGE_KEY,
          JSON.stringify(state.buyNowItem)
        )
      } catch {
        // ignore
      }
    } else if (state?.mode === "cart") {
      setCheckoutMode("cart")
      if (state.voucher === "GENG2026") {
        setVoucherInput("GENG2026")
        setAppliedVoucher("GENG2026")
      }
    }
  }, [location.state])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [checkoutMode])

  // Shipping & Receiver Form States
  const [customerName, setCustomerName] = useState(
    () => user?.username || ""
  )
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [province, setProvince] = useState("TP. Hồ Chí Minh")
  const [district, setDistrict] = useState("")
  const [addressDetail, setAddressDetail] = useState("")
  const [note, setNote] = useState("")

  // Shipping & Payment Method States
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethodType>("standard")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("cod")

  // Voucher State
  const [voucherInput, setVoucherInput] = useState(() =>
    navState?.voucher ? navState.voucher : ""
  )
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(() =>
    navState?.voucher || null
  )

  // Order Submission State
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user?.username && !customerName) {
      setCustomerName(user.username)
    }
  }, [user])

  // Active checkout items based on mode
  const checkoutItems: CartItem[] = useMemo(() => {
    if (checkoutMode === "buy-now") {
      return buyNowItem ? [buyNowItem] : []
    }
    return cartItems
  }, [checkoutMode, buyNowItem, cartItems])

  const totalItemsCount = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + item.quantity, 0),
    [checkoutItems]
  )

  const subtotal = useMemo(
    () =>
      checkoutItems.reduce(
        (sum, item) => sum + (Number(item.product.price) || 0) * item.quantity,
        0
      ),
    [checkoutItems]
  )

  const isFreeStandardShipping = subtotal >= FREE_SHIPPING_THRESHOLD
  const shippingFee =
    checkoutItems.length === 0
      ? 0
      : shippingMethod === "express"
        ? 45000
        : isFreeStandardShipping
          ? 0
          : 30000

  const discountAmount =
    appliedVoucher === "GENG2026" ? Math.round(subtotal * 0.2) : 0

  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee)

  const handleUpdateItemQty = (productId: number, nextQty: number) => {
    if (checkoutMode === "buy-now") {
      if (!buyNowItem) return
      if (nextQty <= 0) {
        setBuyNowItem(null)
        sessionStorage.removeItem(BUY_NOW_STORAGE_KEY)
        return
      }
      const clamped = Math.min(
        nextQty,
        Math.max(1, buyNowItem.product.quantity)
      )
      const updated: CartItem = { ...buyNowItem, quantity: clamped }
      setBuyNowItem(updated)
      sessionStorage.setItem(BUY_NOW_STORAGE_KEY, JSON.stringify(updated))
    } else {
      updateCartQty(productId, nextQty)
    }
  }

  const handleRemoveItem = (productId: number) => {
    if (checkoutMode === "buy-now") {
      setBuyNowItem(null)
      sessionStorage.removeItem(BUY_NOW_STORAGE_KEY)
    } else {
      removeCartItem(productId)
    }
  }

  const handleSwitchMode = (targetMode: "buy-now" | "cart") => {
    setCheckoutMode(targetMode)
    if (targetMode === "buy-now") {
      setSearchParams({ mode: "buy-now" }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }

  const handleApplyVoucher = () => {
    const code = voucherInput.trim().toUpperCase()
    if (!code) {
      toast.warning("Vui lòng nhập mã giảm giá!")
      return
    }
    if (code === "GENG2026") {
      setAppliedVoucher("GENG2026")
      toast.success("Áp dụng mã ưu đãi GENG2026 (-20%) thành công!")
    } else {
      toast.error("Mã giảm giá không hợp lệ hoặc đã hết hạn!")
    }
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (checkoutItems.length === 0) {
      toast.warning("Không có sản phẩm nào để thanh toán!")
      return
    }

    if (!customerName.trim()) {
      toast.warning("Vui lòng nhập họ và tên người nhận!")
      return
    }

    const cleanPhone = customerPhone.trim().replace(/\s+/g, "")
    if (!/^(0|\+84)\d{8,10}$/.test(cleanPhone)) {
      toast.warning(
        "Vui lòng nhập số điện thoại hợp lệ (10 - 11 chữ số, bắt đầu bằng 0 hoặc +84)!"
      )
      return
    }

    if (!addressDetail.trim()) {
      toast.warning("Vui lòng nhập địa chỉ nhận hàng chi tiết!")
      return
    }

    const fullAddress = [
      addressDetail.trim(),
      district.trim(),
      province.trim(),
    ]
      .filter(Boolean)
      .join(", ")

    setSubmitting(true)

    try {
      const createdOrder = await ordersService.create({
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        shippingAddress: fullAddress,
        totalAmount: finalTotal,
        items: checkoutItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: Math.round(Number(item.product.price) || 0),
        })),
      })

      const orderCode = `GENG-${String(createdOrder.id).padStart(6, "0")}`

      const successData: OrderSuccessData = {
        orderId: createdOrder.id,
        orderCode,
        status: createdOrder.status,
        mode: checkoutMode,
        customerName: createdOrder.customerName,
        customerPhone: createdOrder.customerPhone,
        customerEmail: customerEmail.trim(),
        fullAddress: createdOrder.shippingAddress,
        note: note.trim(),
        shippingMethod,
        paymentMethod,
        items: [...checkoutItems],
        subtotal,
        shippingFee,
        discountAmount,
        finalTotal: createdOrder.totalAmount,
        createdAt: new Date(createdOrder.createdAt).toLocaleString("vi-VN"),
      }

      try {
        sessionStorage.setItem(
          LAST_ORDER_STORAGE_KEY,
          JSON.stringify(successData)
        )
      } catch {
        // ignore storage errors
      }

      // IMPORTANT: Only clear Cart if checkout mode is "cart"!
      // If mode is "buy-now", preserve the user's existing Shopping Cart.
      if (checkoutMode === "cart") {
        clearCart()
      } else {
        sessionStorage.removeItem(BUY_NOW_STORAGE_KEY)
        setBuyNowItem(null)
      }

      toast.success(`Đặt hàng thành công! Mã đơn hàng: #${orderCode}`)
      navigate(`/order-success?orderId=${createdOrder.id}`, {
        replace: true,
        state: { order: successData },
      })
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Không thể đặt hàng lúc này, vui lòng kiểm tra lại tồn kho sản phẩm và thử lại!"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  // ============================================================================
  // EMPTY CHECKOUT STATE
  // ============================================================================
  if (checkoutItems.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <Card className="border-dashed border-border bg-card/60 py-14">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h2 className="text-xl font-bold text-foreground">
                {checkoutMode === "buy-now"
                  ? "Chưa có sản phẩm Mua ngay nào được chọn"
                  : "Giỏ hàng của bạn đang trống"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {checkoutMode === "buy-now"
                  ? "Hãy chọn một sản phẩm tại trang Chi tiết và nhấn 'Mua ngay', hoặc chuyển sang thanh toán các sản phẩm đang có trong Giỏ hàng."
                  : "Vui lòng thêm sản phẩm vào giỏ hàng trước khi tiến hành thanh toán."}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {checkoutMode === "buy-now" && cartItems.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => handleSwitchMode("cart")}
                  className="gap-2 rounded-xl border-primary text-primary hover:bg-primary/10 cursor-pointer"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>
                    Chuyển sang thanh toán Giỏ hàng ({cartItems.length} mặt hàng)
                  </span>
                </Button>
              )}
              <Link to="/home#products">
                <Button className="gap-2 rounded-xl font-semibold cursor-pointer">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Khám phá sản phẩm ngay</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ============================================================================
  // MAIN CHECKOUT PAGE
  // ============================================================================
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8 pb-16">
      {/* 1. TOP HEADER & MODE INDICATOR BANNER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Thanh toán đơn hàng
            </h1>
            {checkoutMode === "buy-now" ? (
              <Badge className="gap-1.5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b88917] text-[#09090b] font-extrabold px-3 py-1 text-xs border-0">
                <Zap className="h-3.5 w-3.5 fill-current" />
                <span>Chế độ: Mua ngay nhanh</span>
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="gap-1.5 rounded-full bg-primary/15 text-primary border border-primary/30 px-3 py-1 text-xs font-bold"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>Chế độ: Thanh toán từ Giỏ hàng</span>
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {checkoutMode === "buy-now"
              ? "Bạn đang thanh toán trực tiếp sản phẩm vừa chọn ở trang Chi tiết sản phẩm (Giỏ hàng hiện tại của bạn vẫn được giữ nguyên)."
              : "Bạn đang thanh toán toàn bộ danh sách sản phẩm trong Giỏ hàng của mình."}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Allow switching between Buy-Now and Cart if both exist */}
          {checkoutMode === "buy-now" && cartItems.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSwitchMode("cart")}
              className="gap-1.5 rounded-xl text-xs border-primary/40 text-primary hover:bg-primary/10 cursor-pointer"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Thanh toán Giỏ hàng ({cartItems.length})</span>
            </Button>
          )}
          {checkoutMode === "cart" && buyNowItem && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSwitchMode("buy-now")}
              className="gap-1.5 rounded-xl text-xs border-primary/40 text-primary hover:bg-primary/10 cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Quay lại đơn Mua ngay</span>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Quay lại</span>
          </Button>
        </div>
      </div>

      {/* 2. MAIN TWO-COLUMN CHECKOUT FORM */}
      <form
        onSubmit={handlePlaceOrder}
        className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start"
      >
        {/* =================================================================== */}
        {/* LEFT COLUMN (7 COLS): SHIPPING ADDRESS, DELIVERY & PAYMENT METHOD */}
        {/* =================================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* CARD 1: RECEIVER & SHIPPING ADDRESS */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-foreground">
                  1. Thông tin nhận hàng
                </h2>
                <p className="text-xs text-muted-foreground">
                  Vui lòng điền chính xác thông tin để shipper liên hệ giao hàng
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span>
                    Họ và tên người nhận <span className="text-destructive">*</span>
                  </span>
                </label>
                <Input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="h-10 rounded-xl bg-muted/30 focus:bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <span>
                    Số điện thoại liên hệ <span className="text-destructive">*</span>
                  </span>
                </label>
                <Input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0901 234 567"
                  className="h-10 rounded-xl bg-muted/30 focus:bg-background"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  <span>Email nhận hóa đơn điện tử (Tùy chọn)</span>
                </label>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="h-10 rounded-xl bg-muted/30 focus:bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Tỉnh / Thành phố <span className="text-destructive">*</span>
                </label>
                <Select
                  value={province}
                  onValueChange={(val) => {
                    if (val) setProvince(val)
                  }}
                >
                  <SelectTrigger className="h-10 w-full rounded-xl bg-muted/30">
                    <SelectValue placeholder="Chọn Tỉnh / Thành phố" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVINCES.map((prov) => (
                      <SelectItem key={prov} value={prov}>
                        {prov}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Quận / Huyện, Phường / Xã
                </label>
                <Input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="VD: Phường Bến Nghé, Quận 1"
                  className="h-10 rounded-xl bg-muted/30 focus:bg-background"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground block">
                  Địa chỉ cụ thể (Số nhà, tên đường, tòa nhà){" "}
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  placeholder="VD: Số 123 Đường Nguyễn Huệ"
                  className="h-10 rounded-xl bg-muted/30 focus:bg-background"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <span>Ghi chú giao hàng (Tùy chọn)</span>
                </label>
                <Input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="VD: Giao giờ hành chính, gọi trước khi giao 15 phút..."
                  className="h-10 rounded-xl bg-muted/30 focus:bg-background"
                />
              </div>
            </div>
          </div>

          {/* CARD 2: SHIPPING METHOD */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-foreground">
                  2. Phương thức vận chuyển
                </h2>
                <p className="text-xs text-muted-foreground">
                  Miễn phí vận chuyển tiêu chuẩn cho mọi đơn hàng từ 299.000₫
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div
                onClick={() => setShippingMethod("standard")}
                className={`flex flex-col justify-between gap-2 rounded-2xl border p-4 transition-all cursor-pointer ${
                  shippingMethod === "standard"
                    ? "border-primary bg-primary/10 ring-1 ring-primary/40 shadow-xs"
                    : "border-border bg-background/60 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>Giao hàng Tiêu chuẩn</span>
                  </span>
                  {shippingMethod === "standard" && (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Nhận hàng trong 2 - 4 ngày làm việc toàn quốc
                </p>
                <div className="pt-1">
                  {isFreeStandardShipping ? (
                    <span className="inline-flex items-center rounded-md bg-primary/20 px-2 py-0.5 text-xs font-extrabold text-primary">
                      Miễn phí (0₫)
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-foreground tabular-nums">
                      Phí giao: {formatVND(30000)}
                    </span>
                  )}
                </div>
              </div>

              <div
                onClick={() => setShippingMethod("express")}
                className={`flex flex-col justify-between gap-2 rounded-2xl border p-4 transition-all cursor-pointer ${
                  shippingMethod === "express"
                    ? "border-primary bg-primary/10 ring-1 ring-primary/40 shadow-xs"
                    : "border-border bg-background/60 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Hỏa tốc Gen.G 2H</span>
                  </span>
                  {shippingMethod === "express" && (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Giao siêu tốc trong 2 giờ (Áp dụng nội thành)
                </p>
                <div className="pt-1">
                  <span className="text-xs font-bold text-primary tabular-nums">
                    Phí giao: {formatVND(45000)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: PAYMENT METHOD */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-foreground">
                  3. Phương thức thanh toán
                </h2>
                <p className="text-xs text-muted-foreground">
                  Mọi giao dịch tại GEN.G Store đều được bảo mật tuyệt đối
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              {/* Option 1: COD */}
              <div
                onClick={() => setPaymentMethod("cod")}
                className={`flex items-start gap-3.5 rounded-2xl border p-4 transition-all cursor-pointer ${
                  paymentMethod === "cod"
                    ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                    : "border-border bg-background/60 hover:bg-muted/30"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
                  <Banknote className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">
                      Thanh toán khi nhận hàng (COD)
                    </p>
                    {paymentMethod === "cod" && (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Quý khách được đồng kiểm sản phẩm cùng shipper trước khi thanh
                    toán tiền mặt.
                  </p>
                </div>
              </div>

              {/* Option 2: Bank Transfer VietQR */}
              <div
                onClick={() => setPaymentMethod("bank_qr")}
                className={`flex flex-col gap-3 rounded-2xl border p-4 transition-all cursor-pointer ${
                  paymentMethod === "bank_qr"
                    ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                    : "border-border bg-background/60 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-foreground">
                        Chuyển khoản Ngân hàng 24/7 (VietQR)
                      </p>
                      {paymentMethod === "bank_qr" && (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Quét mã QR ngân hàng tự động điền số tiền và nội dung thanh
                      toán.
                    </p>
                  </div>
                </div>

                {paymentMethod === "bank_qr" && (
                  <div className="mt-1 rounded-xl border border-primary/30 bg-card p-3.5 text-xs space-y-1.5">
                    <p className="font-bold text-primary">
                      Thông tin tài khoản thụ hưởng GEN.G Official Store:
                    </p>
                    <p className="text-foreground">
                      Ngân hàng: <strong>Vietcombank (VCB)</strong> • Số TK:{" "}
                      <strong className="font-mono text-primary">102688889999</strong>
                    </p>
                    <p className="text-foreground">
                      Chủ TK: <strong>CONG TY TNHH GENG STORE VIET NAM</strong>
                    </p>
                    <p className="text-muted-foreground">
                      Nội dung CK:{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
                        GENG {customerPhone || "SDT"}
                      </code>
                    </p>
                  </div>
                )}
              </div>

              {/* Option 3: E-Wallet */}
              <div
                onClick={() => setPaymentMethod("ewallet")}
                className={`flex items-start gap-3.5 rounded-2xl border p-4 transition-all cursor-pointer ${
                  paymentMethod === "ewallet"
                    ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                    : "border-border bg-background/60 hover:bg-muted/30"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
                  <Wallet className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">
                      Ví điện tử MoMo / ZaloPay / VNPay
                    </p>
                    {paymentMethod === "ewallet" && (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Thanh toán siêu tốc bằng mã QR trên ứng dụng ví điện tử.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN (5 COLS): ORDER SUMMARY & ITEMS (STICKY)               */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-5">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
            {/* Summary Header */}
            <div className="flex items-center justify-between border-b border-border/80 bg-[#09090b] px-6 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <img
                  src={gengLogo}
                  alt="Gen.G"
                  className="h-7 w-7 rounded-lg border border-[#d4af37]/40 object-cover"
                />
                <div>
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#f5d061]">
                    Tóm tắt đơn hàng
                  </h2>
                  <p className="text-[11px] text-zinc-400">
                    {checkoutMode === "buy-now"
                      ? "Đơn Mua ngay từ trang chi tiết"
                      : "Đơn thanh toán từ Giỏ hàng"}
                  </p>
                </div>
              </div>
              <Badge className="bg-[#d4af37]/20 text-[#f5d061] border border-[#d4af37]/40 text-xs font-bold tabular-nums">
                {totalItemsCount} sản phẩm
              </Badge>
            </div>

            {/* Product List inside Order Summary */}
            <div className="max-h-[340px] overflow-y-auto divide-y divide-border/60 px-6 py-2">
              {checkoutItems.map(({ product, quantity }) => {
                const unitPrice = Number(product.price) || 0
                const lineTotal = unitPrice * quantity

                return (
                  <div
                    key={product.id}
                    className="flex items-center gap-3.5 py-3.5"
                  >
                    <Link
                      to={`/products/${product.slug}`}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/30"
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

                    <div className="min-w-0 flex-1 space-y-1">
                      <Link
                        to={`/products/${product.slug}`}
                        className="line-clamp-1 text-xs sm:text-sm font-bold text-foreground hover:text-primary transition-colors"
                        title={product.name}
                      >
                        {product.name}
                      </Link>
                      <p className="text-[11px] text-muted-foreground tabular-nums">
                        Đơn giá: {formatVND(unitPrice)}
                      </p>

                      {/* Quantity Stepper in Checkout */}
                      <div className="flex items-center gap-2 pt-0.5">
                        <div className="inline-flex items-center rounded-lg border border-border bg-background p-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateItemQty(product.id, quantity - 1)
                            }
                            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold tabular-nums">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateItemQty(product.id, quantity + 1)
                            }
                            disabled={quantity >= product.quantity}
                            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {checkoutItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(product.id)}
                            className="text-muted-foreground hover:text-destructive p-1 cursor-pointer"
                            title="Xóa khỏi đơn"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-primary tabular-nums">
                        {formatVND(lineTotal)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Voucher Section */}
            <div className="border-t border-border/80 bg-muted/20 px-6 py-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-primary" />
                  <Input
                    type="text"
                    value={voucherInput}
                    onChange={(e) =>
                      setVoucherInput(e.target.value.toUpperCase())
                    }
                    placeholder="Nhập mã giảm giá (VD: GENG2026)"
                    className="h-9 rounded-xl bg-background pl-8 pr-3 text-xs font-mono uppercase"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleApplyVoucher}
                  className="h-9 rounded-xl px-3.5 text-xs font-semibold border-primary/40 text-primary hover:bg-primary/10 cursor-pointer"
                >
                  Áp dụng
                </Button>
              </div>

              {appliedVoucher === "GENG2026" ? (
                <div className="flex items-center justify-between rounded-xl border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs text-primary font-semibold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Đã áp dụng mã GENG2026 (-20%)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedVoucher(null)
                      setVoucherInput("")
                    }}
                    className="text-xs underline hover:opacity-80 cursor-pointer"
                  >
                    Bỏ mã
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setVoucherInput("GENG2026")
                    setAppliedVoucher("GENG2026")
                    toast.success("Đã áp dụng mã ưu đãi GENG2026 (-20%)!")
                  }}
                  className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>
                    Nhấn để áp dụng mã{" "}
                    <strong className="font-mono text-primary underline">
                      GENG2026
                    </strong>{" "}
                    (Giảm 20%)
                  </span>
                </button>
              )}
            </div>

            {/* Financial Summary & Place Order CTA */}
            <div className="border-t border-border/80 px-6 py-5 space-y-4">
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Tạm tính ({totalItemsCount} sản phẩm)</span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {formatVND(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Phí vận chuyển</span>
                  {shippingFee === 0 ? (
                    <span className="font-bold text-primary">Miễn phí</span>
                  ) : (
                    <span className="font-semibold text-foreground tabular-nums">
                      {formatVND(shippingFee)}
                    </span>
                  )}
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-primary">
                    <span>Giảm giá Voucher (GENG2026)</span>
                    <span className="font-bold tabular-nums">
                      -{formatVND(discountAmount)}
                    </span>
                  </div>
                )}

                <Separator className="my-2" />

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-base font-extrabold text-foreground">
                    Tổng thanh toán:
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-primary tabular-nums">
                      {formatVND(finalTotal)}
                    </span>
                    <p className="text-[10px] text-muted-foreground">
                      Đã bao gồm VAT (nếu có)
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full h-12 gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f5d061] to-[#b88917] text-[#09090b] hover:opacity-95 font-extrabold text-sm shadow-lg shadow-[#d4af37]/25 border-0 cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>
                  {submitting
                    ? "Đang xử lý đơn hàng..."
                    : `Đặt hàng ngay • ${formatVND(finalTotal)}`}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
                Bằng việc nhấn <strong>Đặt hàng ngay</strong>, bạn đồng ý với
                Chính sách giao hàng & Bảo mật của GEN.G Store.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
