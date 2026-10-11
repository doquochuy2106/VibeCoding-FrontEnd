import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import {
  ShoppingBag,
  ShoppingCart,
  ArrowLeft,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Heart,
  Package,
  CheckCircle2,
  Plus,
  Minus,
  ChevronRight,
  Sparkles,
  Share2,
} from "lucide-react"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton, ProductCardSkeleton } from "@/components/ui/skeleton"
import { useCart } from "@/hooks/use-cart"
import { productsService, type Product } from "@/services/products.service"
import { getAssetUrl } from "@/lib/utils"
import gengLogo from "@/assets/geng-logo.png"

function formatVND(amount: number | string): string {
  const num = typeof amount === "number" ? amount : Number(amount) || 0
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num)
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loadingRelated, setLoadingRelated] = useState(false)

  // Scroll to top when visiting product detail page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [slug])

  // Fetch product detail by slug
  useEffect(() => {
    if (!slug || !slug.trim()) {
      setError("Đường dẫn sản phẩm không hợp lệ.")
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setQuantity(1)

    productsService
      .getBySlug(slug.trim(), controller.signal)
      .then((data) => {
        setProduct(data)
      })
      .catch((err) => {
        if (err?.name === "CanceledError" || err?.name === "AbortError") return
        setError(
          err?.response?.data?.message ||
            "Không tìm thấy sản phẩm hoặc sản phẩm đã ngừng kinh doanh."
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [slug])

  // Fetch related products in the same category
  useEffect(() => {
    if (!product) return
    const controller = new AbortController()
    setLoadingRelated(true)

    productsService
      .list(
        {
          page: 1,
          limit: 5,
          categoryId: product.categoryId ?? undefined,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
        controller.signal
      )
      .then((res) => {
        const list = (res.data ?? []).filter((p) => p.id !== product.id).slice(0, 4)
        setRelatedProducts(list)
      })
      .catch(() => {
        // ignore abort
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingRelated(false)
        }
      })

    return () => controller.abort()
  }, [product])

  const handleAddToCart = (targetProduct: Product, qty = 1) => {
    if (!targetProduct.isActive || targetProduct.quantity <= 0) {
      toast.warning("Sản phẩm này hiện đang tạm hết hàng!")
      return
    }
    addItem(targetProduct, qty)
    toast.success(`Đã thêm ${qty}x "${targetProduct.name}" vào giỏ hàng!`)
  }

  const handleBuyNow = () => {
    if (!product) return
    if (!product.isActive || product.quantity <= 0) {
      toast.warning("Sản phẩm này hiện đang tạm hết hàng!")
      return
    }
    const buyNowPayload = { product, quantity }
    try {
      sessionStorage.setItem(
        "vibecoding_buy_now_item",
        JSON.stringify(buyNowPayload)
      )
    } catch {
      // ignore storage errors
    }
    navigate("/checkout?mode=buy-now", {
      state: {
        mode: "buy-now",
        buyNowItem: buyNowPayload,
      },
    })
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    toast.info("Đã sao chép đường dẫn sản phẩm!")
  }

  const serviceGuarantees = [
    {
      icon: Truck,
      title: "Giao hàng toàn quốc",
      desc: "Miễn phí vận chuyển đơn từ 299.000₫",
    },
    {
      icon: ShieldCheck,
      title: "Chính hãng 100%",
      desc: "Cam kết chuẩn Gen.G Official Store",
    },
    {
      icon: RotateCcw,
      title: "Đổi trả 30 ngày",
      desc: "Hỗ trợ đổi size tận nơi miễn phí",
    },
    {
      icon: Headphones,
      title: "Hỗ trợ 24/7",
      desc: "Hotline CSKH: 1900 6868",
    },
  ]

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24 rounded" />
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-5 w-48 rounded" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div className="lg:col-span-5">
            <Skeleton className="aspect-square w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-7 space-y-5">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-36 rounded-full" />
            </div>
            <Skeleton className="h-9 w-4/5 rounded-xl" />
            <Skeleton className="h-4 w-48 rounded" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
            </div>
            <div className="flex gap-3 pt-4">
              <Skeleton className="h-12 w-36 rounded-xl" />
              <Skeleton className="h-12 flex-1 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="border-dashed border-border bg-card/60 py-16">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Package className="h-8 w-8" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h2 className="text-xl font-bold text-foreground">
                Không tìm thấy sản phẩm
              </h2>
              <p className="text-sm text-muted-foreground">
                {error || "Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="gap-2 rounded-xl cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Quay lại</span>
              </Button>
              <Link to="/home#products">
                <Button className="gap-2 rounded-xl cursor-pointer">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Khám phá sản phẩm khác</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isOutOfStock = !product.isActive || product.quantity <= 0
  const isLowStock =
    product.isActive && product.quantity > 0 && product.quantity <= 10
  const numericPrice = Number(product.price) || 0
  const originalPrice = Math.round((numericPrice * 1.18) / 1000) * 1000
  const savedAmount = Math.max(0, originalPrice - numericPrice)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-12 pb-16">
      {/* 1. BREADCRUMB & BACK NAVIGATION */}
      <div className="flex flex-wrap items-center justify-between gap-4">
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
          {product.category ? (
            <>
              <Link
                to={`/home?categoryId=${product.category.id}#products`}
                className="hover:text-primary transition-colors font-medium"
              >
                {product.category.name}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            </>
          ) : (
            <>
              <Link
                to="/home#products"
                className="hover:text-primary transition-colors font-medium"
              >
                Sản phẩm
              </Link>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            </>
          )}
          <span className="font-semibold text-foreground truncate max-w-[240px] sm:max-w-md">
            {product.name}
          </span>
        </nav>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/home#products")}
          className="gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Quay lại danh sách sản phẩm</span>
        </Button>
      </div>

      {/* 2. MAIN PRODUCT DETAIL CARD */}
      <section className="rounded-3xl border border-border bg-card p-5 sm:p-8 lg:p-10 shadow-sm">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* LEFT: PRODUCT IMAGE SHOWCASE */}
          <div className="lg:col-span-5 space-y-4">
            <div className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-muted/30 flex items-center justify-center">
              {product.imageUrl ? (
                <img
                  src={getAssetUrl(product.imageUrl)}
                  alt={product.name}
                  className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                    isOutOfStock ? "opacity-65 grayscale-[25%]" : ""
                  }`}
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <ShoppingBag className="h-16 w-16 stroke-[1.2]" />
                  <span className="text-xs">Chưa có hình ảnh sản phẩm</span>
                </div>
              )}

              {/* Top-left Promo / Stock Badges */}
              <div className="absolute left-3.5 top-3.5 flex flex-col gap-1.5 items-start">
                {isOutOfStock ? (
                  <Badge
                    variant="destructive"
                    className="rounded-lg px-2.5 py-1 text-xs font-semibold shadow-sm"
                  >
                    Tạm hết hàng
                  </Badge>
                ) : (
                  <span className="rounded-lg bg-rose-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                    -15% OFF
                  </span>
                )}
                {isLowStock && (
                  <span className="rounded-lg bg-amber-500/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-xs">
                    Chỉ còn {product.quantity} sản phẩm
                  </span>
                )}
              </div>

              {/* Top-right Actions */}
              <div className="absolute right-3.5 top-3.5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsWishlisted((prev) => {
                      const next = !prev
                      if (next) {
                        toast.success(`Đã thêm "${product.name}" vào yêu thích!`)
                      } else {
                        toast.info(`Đã bỏ "${product.name}" khỏi yêu thích`)
                      }
                      return next
                    })
                  }}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md shadow-sm transition-colors cursor-pointer ${
                    isWishlisted
                      ? "border-rose-500 bg-rose-500 text-white"
                      : "border-border/60 bg-background/85 text-foreground hover:bg-primary hover:text-primary-foreground"
                  }`}
                  title="Yêu thích"
                >
                  <Heart
                    className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`}
                  />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/85 text-foreground backdrop-blur-md shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground cursor-pointer"
                  title="Chia sẻ sản phẩm"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Authentic Banner Strip below Image */}
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-[#09090b] px-4 py-3 text-white">
              <div className="flex items-center gap-2.5">
                <img
                  src={gengLogo}
                  alt="Gen.G Official"
                  className="h-7 w-7 rounded-md border border-[#d4af37]/40 object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-[#f5d061] uppercase tracking-wider">
                    GEN.G OFFICIAL MERCHANDISE
                  </p>
                  <p className="text-[11px] text-zinc-300">
                    Sản phẩm phân phối chính thức tại Tiger Nation Shop
                  </p>
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-[#d4af37] shrink-0" />
            </div>
          </div>

          {/* RIGHT: PRODUCT DETAILS & PURCHASE CONTROLS */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Badges & Rating Row */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {product.category ? (
                  <Link to={`/home?categoryId=${product.category.id}#products`}>
                    <Badge
                      variant="default"
                      className="text-xs cursor-pointer hover:opacity-90"
                    >
                      {product.category.name}
                    </Badge>
                  </Link>
                ) : (
                  <Badge variant="default" className="text-xs">
                    Chưa phân loại
                  </Badge>
                )}

                {!isOutOfStock ? (
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-primary/15 text-primary border border-primary/30 text-xs font-semibold"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Còn hàng ({product.quantity} sản phẩm)</span>
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    Hết hàng
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-500" />
                  ))}
                </div>
                <span className="text-foreground font-bold">4.9</span>
                <span className="text-muted-foreground font-normal">
                  (128 đánh giá)
                </span>
              </div>
            </div>

            {/* Title & SKU */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
                {product.name}
              </h1>
              <p className="font-mono text-xs text-muted-foreground">
                Mã sản phẩm: <span className="text-foreground font-semibold">#{product.id}</span> • Slug:{" "}
                <span className="text-foreground">/{product.slug}</span>
              </p>
            </div>

            {/* Price Box */}
            <div className="flex flex-wrap items-baseline justify-between gap-4 rounded-2xl border border-primary/20 bg-muted/50 p-5">
              <div className="space-y-1">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-primary tabular-nums">
                    {formatVND(numericPrice)}
                  </span>
                  {numericPrice > 0 && (
                    <span className="text-base text-muted-foreground line-through tabular-nums">
                      {formatVND(originalPrice)}
                    </span>
                  )}
                </div>
                {savedAmount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Tiết kiệm ngay:{" "}
                    <span className="font-bold text-primary tabular-nums">
                      {formatVND(savedAmount)}
                    </span>{" "}
                    (Đã bao gồm thuế VAT)
                  </p>
                )}
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary/15 px-3 py-1.5 text-xs font-bold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ưu đãi Pro Kit 2026</span>
              </span>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Mô tả chi tiết sản phẩm
              </h3>
              <div className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                {product.description ||
                  "Sản phẩm chính hãng chất lượng cao thuộc bộ sưu tập Gen.G 2026 Pro Collection. Chất liệu thoáng mát, bền bỉ, form dáng chuẩn cùng thiết kế sắc Vàng - Đen đặc trưng."}
              </div>
            </div>

            <Separator />

            {/* Quantity & Add to Cart Controls */}
            {!isOutOfStock ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-sm font-semibold text-foreground">
                    Số lượng:
                  </span>
                  <div className="flex items-center rounded-xl border border-border bg-card">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="p-2.5 text-muted-foreground hover:text-foreground disabled:opacity-40 cursor-pointer"
                      aria-label="Giảm số lượng"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-5 text-sm font-bold tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Math.min(product.quantity, q + 1))
                      }
                      disabled={quantity >= product.quantity}
                      className="p-2.5 text-muted-foreground hover:text-foreground disabled:opacity-40 cursor-pointer"
                      aria-label="Tăng số lượng"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {product.quantity} sản phẩm có sẵn trong kho
                  </span>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    onClick={() => handleAddToCart(product, quantity)}
                    className="flex-1 gap-2 rounded-xl border-primary text-primary hover:bg-primary/10 font-bold h-12 cursor-pointer"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Thêm vào giỏ hàng</span>
                  </Button>

                  <Button
                    type="button"
                    size="lg"
                    onClick={handleBuyNow}
                    className="flex-1 gap-2 rounded-xl font-bold shadow-lg shadow-primary/25 h-12 cursor-pointer"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>
                      Mua ngay • {formatVND(numericPrice * quantity)}
                    </span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  disabled
                  size="lg"
                  variant="secondary"
                  className="w-full rounded-xl h-12 font-semibold"
                >
                  Sản phẩm hiện đang tạm hết hàng
                </Button>
              </div>
            )}

            {/* Service Guarantee Grid */}
            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
              {serviceGuarantees.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/20 p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. RELATED PRODUCTS SECTION */}
      {(loadingRelated || relatedProducts.length > 0) && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground">
                Sản phẩm cùng danh mục
              </h2>
              <p className="text-xs text-muted-foreground">
                Gợi ý các sản phẩm tương tự tại GEN.G Store
              </p>
            </div>
            <Link
              to={
                product.categoryId
                  ? `/home?categoryId=${product.categoryId}#products`
                  : "/home#products"
              }
            >
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary">
                <span>Xem tất cả</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loadingRelated ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((rel) => {
                const relOutOfStock = !rel.isActive || rel.quantity <= 0
                const relPrice = Number(rel.price) || 0
                const relOriginalPrice =
                  Math.round((relPrice * 1.18) / 1000) * 1000

                return (
                  <div
                    key={rel.id}
                    onClick={() => navigate(`/products/${rel.slug}`)}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl cursor-pointer"
                  >
                    <div>
                      <div className="relative aspect-square w-full overflow-hidden bg-muted/40">
                        {rel.imageUrl ? (
                          <img
                            src={getAssetUrl(rel.imageUrl)}
                            alt={rel.name}
                            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                              relOutOfStock ? "opacity-60 grayscale-[30%]" : ""
                            }`}
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                            <ShoppingBag className="h-10 w-10 stroke-[1.25]" />
                            <span className="text-xs">Chưa có ảnh</span>
                          </div>
                        )}
                      </div>

                      <div className="p-3.5 pb-1.5 space-y-1.5">
                        <div className="flex items-center justify-between gap-1.5 text-xs">
                          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary truncate max-w-[130px]">
                            {rel.category?.name || product.category?.name || "Thời trang"}
                          </span>
                          <span className="flex items-center gap-0.5 text-amber-500 text-[11px] font-semibold shrink-0">
                            <Star className="h-3 w-3 fill-amber-500" />
                            <span>4.9</span>
                          </span>
                        </div>

                        <h3
                          className="line-clamp-2 text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors min-h-[2.25rem] leading-snug"
                          title={rel.name}
                        >
                          {rel.name}
                        </h3>
                      </div>
                    </div>

                    <div className="p-3.5 pt-2 space-y-2.5">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-baseline justify-between gap-1">
                          <span className="text-sm sm:text-base font-extrabold text-primary tabular-nums">
                            {formatVND(relPrice)}
                          </span>
                          <span className="text-[10px] text-muted-foreground tabular-nums">
                            Kho: {rel.quantity}
                          </span>
                        </div>
                        {relPrice > 0 && (
                          <span className="text-[11px] text-muted-foreground line-through tabular-nums">
                            {formatVND(relOriginalPrice)}
                          </span>
                        )}
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        disabled={relOutOfStock}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddToCart(rel, 1)
                        }}
                        className="w-full gap-1.5 rounded-xl font-semibold shadow-xs cursor-pointer h-9 text-xs"
                        variant={relOutOfStock ? "secondary" : "default"}
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>
                          {relOutOfStock ? "Tạm hết hàng" : "Thêm vào giỏ"}
                        </span>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
