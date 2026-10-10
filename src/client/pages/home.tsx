import { useState, useEffect, useMemo, useRef } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  Sparkles,
  ArrowRight,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  SlidersHorizontal,
  X,
  Heart,
  Eye,
  Package,
  CheckCircle2,
  FolderTree,
  Flame,
  Tag,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Grid3X3,
  Shirt,
  Layers,
  Footprints,
  Briefcase,
  Watch,
  Glasses,
  Wallet,
  Award,
  Dumbbell,
  Crown,
  Moon,
  Gem,
  Cpu,
  type LucideIcon,
} from "lucide-react"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Skeleton,
  ProductCardSkeleton,
  ShopeeCategoryGridSkeleton,
} from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"
import { productsService, type Product } from "@/services/products.service"
import { categoriesService, type Category } from "@/services/categories.service"
import { getAssetUrl } from "@/lib/utils"
import gengLogo from "@/assets/geng-logo.png"
import gengHero from "@/assets/geng-hero.png"
import gengChamps from "@/assets/geng-champs.png"

function formatVND(amount: number | string): string {
  const num = typeof amount === "number" ? amount : Number(amount) || 0
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num)
}

export function getCategoryVisual(slug = "", name = ""): {
  icon: LucideIcon
  defaultImage: string
} {
  const key = `${slug} ${name}`.toLowerCase()
  if (key.includes("thun") || key.includes("polo")) {
    return {
      icon: Shirt,
      defaultImage:
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&q=80",
    }
  }
  if (key.includes("jean") || key.includes("kaki") || key.includes("quan")) {
    return {
      icon: Layers,
      defaultImage:
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&q=80",
    }
  }
  if (key.includes("khoac") || key.includes("hoodie")) {
    return {
      icon: Flame,
      defaultImage:
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&q=80",
    }
  }
  if (key.includes("giay") || key.includes("sneaker")) {
    return {
      icon: Footprints,
      defaultImage:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80",
    }
  }
  if (key.includes("balo") || key.includes("tui")) {
    return {
      icon: Briefcase,
      defaultImage:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&q=80",
    }
  }
  if (key.includes("dong-ho") || key.includes("trang-suc")) {
    return {
      icon: Watch,
      defaultImage:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80",
    }
  }
  if (key.includes("kinh")) {
    return {
      icon: Glasses,
      defaultImage:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&q=80",
    }
  }
  if (key.includes("vi-da") || key.includes("that-lung")) {
    return {
      icon: Wallet,
      defaultImage:
        "https://images.unsplash.com/photo-1627123424574-724758594e93?w=300&q=80",
    }
  }
  if (key.includes("so-mi") || key.includes("cong-so")) {
    return {
      icon: Award,
      defaultImage:
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&q=80",
    }
  }
  if (key.includes("the-thao") || key.includes("gym")) {
    return {
      icon: Dumbbell,
      defaultImage:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&q=80",
    }
  }
  if (key.includes("mu-non") || key.includes("khan")) {
    return {
      icon: Crown,
      defaultImage:
        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&q=80",
    }
  }
  if (key.includes("mac-nha") || key.includes("ngu")) {
    return {
      icon: Moon,
      defaultImage:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80",
    }
  }
  if (key.includes("tat-vo") || key.includes("nho")) {
    return {
      icon: Gem,
      defaultImage:
        "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=300&q=80",
    }
  }
  if (key.includes("nuoc-hoa") || key.includes("cham-soc")) {
    return {
      icon: Sparkles,
      defaultImage:
        "https://images.unsplash.com/photo-1541643600914-78b084683601?w=300&q=80",
    }
  }
  if (key.includes("cong-nghe") || key.includes("tech")) {
    return {
      icon: Cpu,
      defaultImage:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80",
    }
  }
  return {
    icon: ShoppingBag,
    defaultImage:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80",
  }
}

type PriceRangeKey = "all" | "under250" | "250to500" | "over500"

const PRICE_RANGES: Array<{
  key: PriceRangeKey
  label: string
  min?: number
  max?: number
}> = [
  { key: "all", label: "Tất cả mức giá" },
  { key: "under250", label: "Dưới 250.000₫", min: 0, max: 250000 },
  { key: "250to500", label: "250.000₫ - 500.000₫", min: 250000, max: 500000 },
  { key: "over500", label: "Trên 500.000₫", min: 500000 },
]

const SORT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "createdAt:desc", label: "Mới nhất" },
  { value: "price:asc", label: "Giá: Thấp đến Cao" },
  { value: "price:desc", label: "Giá: Cao đến Thấp" },
  { value: "name:asc", label: "Tên: A - Z" },
  { value: "name:desc", label: "Tên: Z - A" },
]

export default function HomePage() {
  const { user, isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()

  // Filter states
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const categoryScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollCatLeft, setCanScrollCatLeft] = useState(false)
  const [canScrollCatRight, setCanScrollCatRight] = useState(true)

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">(
    () => {
      const catParam = searchParams.get("categoryId")
      return catParam && Number(catParam) > 0 ? Number(catParam) : "all"
    }
  )
  const [search, setSearch] = useState(() => searchParams.get("search") || "")
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [priceRange, setPriceRange] = useState<PriceRangeKey>("all")
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [sortOption, setSortOption] = useState("createdAt:desc")
  const [page, setPage] = useState(1)
  const [gridCols, setGridCols] = useState<3 | 4>(4)

  // Products state
  const [products, setProducts] = useState<Product[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingProducts, setLoadingProducts] = useState(true)

  // Wishlist & QuickView state
  const [wishlistIds, setWishlistIds] = useState<number[]>([])
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [quickViewQty, setQuickViewQty] = useState(1)

  const LIMIT = 4

  // Sync URL search param if changed from header search
  useEffect(() => {
    const urlSearch = searchParams.get("search") ?? ""
    if (urlSearch !== search) {
      setSearch(urlSearch)
    }
    const urlCategory = searchParams.get("categoryId")
    if (urlCategory && Number(urlCategory) > 0) {
      setSelectedCategoryId(Number(urlCategory))
    }
  }, [searchParams])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Load categories (up to 50)
  useEffect(() => {
    const controller = new AbortController()
    setLoadingCategories(true)
    categoriesService
      .list(
        { page: 1, limit: 50, sortBy: "id", sortOrder: "asc" },
        controller.signal
      )
      .then((res) => {
        setCategories(res.data ?? [])
      })
      .catch(() => {
        // ignore abort error
      })
      .finally(() => {
        setLoadingCategories(false)
      })
    return () => controller.abort()
  }, [])

  // Load products based on filters
  useEffect(() => {
    const controller = new AbortController()
    setLoadingProducts(true)

    const [sortBy, sortOrder] = sortOption.split(":") as [
      string,
      "asc" | "desc",
    ]
    const currentPriceObj = PRICE_RANGES.find((r) => r.key === priceRange)

    productsService
      .list(
        {
          page,
          limit: LIMIT,
          search: debouncedSearch.trim() || undefined,
          categoryId:
            selectedCategoryId !== "all" ? selectedCategoryId : undefined,
          minPrice: currentPriceObj?.min,
          maxPrice: currentPriceObj?.max,
          isActive: onlyInStock ? "true" : undefined,
          sortBy,
          sortOrder,
        },
        controller.signal
      )
      .then((res) => {
        const list = res.data ?? []
        const filtered = onlyInStock
          ? list.filter((p) => p.isActive && p.quantity > 0)
          : list
        setProducts(filtered)
        setTotalProducts(res.meta?.total ?? filtered.length)
        setTotalPages(res.meta?.totalPages ?? 1)
      })
      .catch(() => {
        // ignore abort
      })
      .finally(() => {
        setLoadingProducts(false)
      })

    return () => controller.abort()
  }, [
    page,
    debouncedSearch,
    selectedCategoryId,
    priceRange,
    onlyInStock,
    sortOption,
  ])

  const selectedCategoryObj = useMemo(
    () =>
      selectedCategoryId === "all"
        ? null
        : categories.find((c) => c.id === selectedCategoryId) || null,
    [categories, selectedCategoryId]
  )

  const updateCategoryScrollState = () => {
    const el = categoryScrollRef.current
    if (!el) return
    setCanScrollCatLeft(el.scrollLeft > 8)
    setCanScrollCatRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }

  useEffect(() => {
    updateCategoryScrollState()
    window.addEventListener("resize", updateCategoryScrollState)
    return () => window.removeEventListener("resize", updateCategoryScrollState)
  }, [categories])

  const scrollCategories = (direction: "left" | "right") => {
    const el = categoryScrollRef.current
    if (!el) return
    const scrollAmount = Math.max(el.clientWidth * 0.65, 320)
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  const handleSelectCategory = (catId: number | "all") => {
    setSelectedCategoryId(catId)
    setPage(1)
    const nextParams = new URLSearchParams(searchParams)
    if (catId === "all") {
      nextParams.delete("categoryId")
    } else {
      nextParams.set("categoryId", String(catId))
    }
    setSearchParams(nextParams, { replace: true })
  }

  const handleResetFilters = () => {
    setSelectedCategoryId("all")
    setSearch("")
    setDebouncedSearch("")
    setPriceRange("all")
    setOnlyInStock(false)
    setSortOption("createdAt:desc")
    setPage(1)
    setSearchParams({}, { replace: true })
  }

  const hasActiveFilters =
    selectedCategoryId !== "all" ||
    debouncedSearch.trim() !== "" ||
    priceRange !== "all" ||
    onlyInStock

  const toggleWishlist = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    setWishlistIds((prev) => {
      const exists = prev.includes(product.id)
      if (exists) {
        toast.info(`Đã bỏ "${product.name}" khỏi danh sách yêu thích`)
        return prev.filter((id) => id !== product.id)
      } else {
        toast.success(`Đã thêm "${product.name}" vào yêu thích!`)
        return [...prev, product.id]
      }
    })
  }

  const handleAddToCart = (product: Product, qty = 1, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!product.isActive || product.quantity <= 0) {
      toast.warning("Sản phẩm này hiện đang tạm hết hàng!")
      return
    }
    addItem(product, qty)
    toast.success(`Đã thêm ${qty}x "${product.name}" vào giỏ hàng!`)
  }

  const openQuickView = (product: Product, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setQuickViewProduct(product)
    setQuickViewQty(1)
  }

  const serviceBadges = [
    {
      icon: Truck,
      title: "Giao hàng toàn quốc",
      desc: "Miễn phí đơn từ 299.000₫",
    },
    {
      icon: ShieldCheck,
      title: "Cam kết chính hãng",
      desc: "Hoàn tiền 200% nếu giả",
    },
    {
      icon: RotateCcw,
      title: "Đổi trả 30 ngày",
      desc: "Đổi size tận nơi miễn phí",
    },
    {
      icon: Headphones,
      title: "Hỗ trợ 24/7",
      desc: "Tư vấn tận tâm, nhanh chóng",
    },
  ]

  const isInitialPageLoad = loadingCategories && categories.length === 0

  return (
    <div className="space-y-10 pb-16 pt-6 md:space-y-14 md:pt-8">
      {/* 1. HERO BANNER & GEN.G CHAMPS SHOWCASE SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {isInitialPageLoad ? (
          <>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-stretch">
              <div className="rounded-3xl border border-border bg-card p-7 sm:p-10 lg:col-span-8 flex flex-col justify-between min-h-[390px] sm:min-h-[430px]">
                <div className="space-y-4 max-w-xl">
                  <Skeleton className="h-7 w-64 rounded-full" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                  <Skeleton className="h-11 w-4/5 rounded-xl" />
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-2/3 rounded" />
                </div>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Skeleton className="h-11 w-40 rounded-xl" />
                  <Skeleton className="h-11 w-48 rounded-xl" />
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 lg:col-span-4 min-h-[390px] sm:min-h-[430px] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-36 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
                <div className="space-y-2.5">
                  <Skeleton className="h-3.5 w-48 rounded" />
                  <Skeleton className="h-6 w-56 rounded" />
                  <Skeleton className="h-3.5 w-full rounded" />
                  <Skeleton className="h-9 w-44 rounded-xl mt-2" />
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs lg:grid-cols-4 sm:p-5">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3.5 px-2">
                  <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-3 w-36 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-stretch">
              {/* Main Hero Banner with geng-hero.png */}
              <div className="group relative overflow-hidden rounded-3xl border border-primary/30 bg-[#0b0b0d] p-7 text-white shadow-2xl sm:p-10 lg:col-span-8 flex flex-col justify-between min-h-[390px] sm:min-h-[430px]">
                {/* Background Hero Image */}
                <img
                  src={gengHero}
                  alt="Gen.G Roster Banner"
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                {/* Multi-layer Dark & Gold Gradient Overlay for crisp text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/95 via-[#09090b]/75 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/90 via-transparent to-[#09090b]/30" />
                <div className="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-[#d4af37]/20 blur-3xl" />

                {/* Top Content */}
                <div className="relative z-10 max-w-xl space-y-4">
                  <div className="inline-flex items-center gap-2.5 rounded-full border border-[#d4af37]/40 bg-black/65 px-3.5 py-1.5 text-xs font-bold text-[#f3cc56] backdrop-blur-md shadow-md">
                    <img
                      src={gengLogo}
                      alt="Gen.G Logo"
                      className="h-4 w-4 object-contain bg-white/90 rounded-xs p-0.5"
                    />
                    <span className="tracking-wide uppercase">
                      {isAuthenticated && user
                        ? `WELCOME BACK, ${user.username}! • GEN.G OFFICIAL`
                        : "GEN.G OFFICIAL STORE • 2026 PRO COLLECTION"}
                    </span>
                  </div>

                  <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl leading-tight drop-shadow-md">
                    Khoác lên bản lĩnh{" "}
                    <span className="bg-gradient-to-r from-[#f7d969] via-[#d4af37] to-[#b88917] bg-clip-text text-transparent">
                      Nhà Vô Địch GEN.G
                    </span>
                  </h1>

                  <p className="text-sm text-zinc-200 sm:text-base leading-relaxed max-w-lg drop-shadow-xs">
                    Sở hữu trọn bộ trang phục thi đấu Pro Kit, áo khoác Descente x Gen.G,
                    balo và phụ kiện chính hãng lấy cảm hứng từ sắc Vàng - Đen huyền thoại.
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="relative z-10 mt-8 flex flex-wrap items-center gap-3">
                  <a href="#products">
                    <Button
                      size="lg"
                      className="gap-2 rounded-xl bg-[#d4af37] text-[#09090b] hover:bg-[#e5c247] font-bold shadow-lg shadow-[#d4af37]/30 cursor-pointer border-0"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>Mua sắm ngay</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </a>
                  <a href="#categories">
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 rounded-xl border-[#d4af37]/40 bg-black/55 text-[#f7d969] hover:bg-[#d4af37]/20 hover:text-white backdrop-blur-md cursor-pointer"
                    >
                      <FolderTree className="h-4 w-4" />
                      <span>Khám phá {categories.length || 15} danh mục</span>
                    </Button>
                  </a>
                  {isAuthenticated && user?.role?.toUpperCase() === "ADMIN" && (
                    <Link to="/admin/products">
                      <Button
                        variant="secondary"
                        size="lg"
                        className="gap-2 rounded-xl font-semibold cursor-pointer bg-white/90 text-black hover:bg-white"
                      >
                        <ShieldCheck className="h-4 w-4 text-[#b88917]" />
                        <span>Quản lý sản phẩm</span>
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Right Side Poster Card: geng-champs.png (2026 LCK CUP CHAMPS) */}
              <div className="group relative overflow-hidden rounded-3xl border border-primary/30 bg-[#0b0b0d] shadow-2xl lg:col-span-4 min-h-[390px] sm:min-h-[430px] flex flex-col justify-end p-6 text-white">
                <img
                  src={gengChamps}
                  alt="Gen.G 2026 LCK Cup Champs"
                  className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />

                {/* Floating Top Badge */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d4af37]/50 bg-black/75 px-3 py-1 text-[11px] font-bold text-[#f5d056] backdrop-blur-md">
                    <Flame className="h-3.5 w-3.5 text-[#f5d056]" />
                    2026 LCK CUP CHAMPS
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 p-1 shadow-md">
                    <img
                      src={gengLogo}
                      alt="Gen.G Shield"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>

                {/* Bottom Overlay Content */}
                <div className="relative z-10 space-y-2.5 pt-24">
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-[#f5d056]">
                    <span>DURO</span>•<span>KIIN</span>•<span>CHOVY</span>•
                    <span>RULER</span>•<span>CANYON</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white leading-snug">
                    Championship Gold Edition
                  </h3>
                  <p className="text-xs text-zinc-300 line-clamp-2">
                    Bộ sưu tập kỷ niệm chức vô địch LCK Cup 2026 với ưu đãi giảm đến 30% cho toàn bộ Áo khoác & Phụ kiện.
                  </p>
                  <div className="pt-1">
                    <a
                      href="#products"
                      onClick={() => {
                        const aoKhoacCat = categories.find((c) =>
                          c.slug.includes("ao-khoac")
                        )
                        if (aoKhoacCat) handleSelectCategory(aoKhoacCat.id)
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#d4af37] px-3.5 py-2 text-xs font-bold text-[#09090b] shadow-md transition-transform hover:scale-[1.02]"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Săn bộ sưu tập Vô Địch</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Guarantee Strip */}
            <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs lg:grid-cols-4 sm:p-5">
              {serviceBadges.map((item) => (
                <div key={item.title} className="flex items-center gap-3.5 px-2">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold text-foreground">
                      {item.title}
                    </h4>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* 2. DANH MỤC SẢN PHẨM (SHOPEE STYLE 2-ROW HORIZONTAL GRID) */}
      <section
        id="categories"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 scroll-mt-20"
      >
        <div className="relative group/catbox">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {/* Top Header Bar: DANH MỤC */}
            <div className="flex items-center justify-between border-b border-border/80 px-5 py-4">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold uppercase tracking-wider text-muted-foreground">
                  DANH MỤC
                </h2>
                {selectedCategoryObj && (
                  <Badge
                    variant="secondary"
                    className="gap-1.5 bg-primary/15 text-primary border border-primary/30 font-semibold"
                  >
                    <span>Đang lọc: {selectedCategoryObj.name}</span>
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedCategoryId !== "all" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectCategory("all")}
                    className="h-8 gap-1.5 text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Xem tất cả ({totalProducts})</span>
                  </Button>
                )}
                {loadingCategories ? (
                  <Skeleton className="h-4 w-20 rounded" />
                ) : (
                  <span className="hidden sm:inline-block text-xs text-muted-foreground">
                    {categories.length} danh mục
                  </span>
                )}
              </div>
            </div>

            {/* 2-Row Horizontal Grid Body */}
            {loadingCategories ? (
              <ShopeeCategoryGridSkeleton count={14} />
            ) : (
              <div
                ref={categoryScrollRef}
                onScroll={updateCategoryScrollState}
                className="grid grid-rows-2 grid-flow-col auto-cols-[33.3333%] sm:auto-cols-[25%] md:auto-cols-[16.6667%] lg:auto-cols-[14.2857%] overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {[
                  {
                    id: "all" as const,
                    name: "Tất Cả Sản Phẩm",
                    slug: "all-collection",
                    imageUrl: null as string | null | undefined,
                    defaultImage:
                      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&q=80",
                    count: totalProducts,
                  },
                  ...categories.map((cat) => {
                    const visual = getCategoryVisual(cat.slug, cat.name)
                    return {
                      id: cat.id,
                      name: cat.name,
                      slug: cat.slug,
                      imageUrl: cat.imageUrl,
                      defaultImage: visual.defaultImage,
                      count: cat._count?.products ?? 0,
                    }
                  }),
                ].map((item) => {
                  const isSelected = selectedCategoryId === item.id
                  const displayImg = item.imageUrl
                    ? getAssetUrl(item.imageUrl)
                    : item.defaultImage

                  return (
                    <button
                      key={String(item.id)}
                      type="button"
                      onClick={() => {
                        if (item.id === "all") {
                          handleSelectCategory("all")
                        } else {
                          handleSelectCategory(
                            isSelected ? "all" : (item.id as number)
                          )
                        }
                      }}
                      className={`group relative flex flex-col items-center justify-start border-r border-b border-border/60 px-2.5 py-4 text-center transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-primary/10 z-10 shadow-inner"
                          : "bg-card hover:bg-muted/30 hover:z-10 hover:shadow-md"
                      }`}
                    >
                      {/* Circular Category Image Container (Shopee style) */}
                      <div
                        className={`relative mb-2.5 flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted/40 transition-all duration-300 group-hover:scale-105 ${
                          isSelected
                            ? "border-primary ring-2 ring-primary/50 shadow-md"
                            : "border-border/80 group-hover:border-primary/50"
                        }`}
                      >
                        <img
                          src={displayImg}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            if (e.currentTarget.src !== item.defaultImage) {
                              e.currentTarget.src = item.defaultImage
                            }
                          }}
                        />

                        {/* Selected Checkmark Overlay Badge */}
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                            <CheckCircle2 className="h-6 w-6 text-primary drop-shadow" />
                          </div>
                        )}
                      </div>

                      {/* Category Name (Centered 2-line max) */}
                      <span
                        className={`line-clamp-2 text-xs sm:text-[13px] leading-snug transition-colors ${
                          isSelected
                            ? "font-bold text-primary"
                            : "font-medium text-foreground/90 group-hover:text-primary"
                        }`}
                      >
                        {item.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Floating Left Arrow Button (Shopee Style) */}
          {!loadingCategories && canScrollCatLeft && (
            <button
              type="button"
              onClick={() => scrollCategories("left")}
              aria-label="Trượt danh mục sang trái"
              className="absolute -left-3 sm:-left-5 top-[56%] -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-lg transition-all duration-200 hover:scale-125 hover:border-primary hover:text-primary cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Floating Right Arrow Button (Shopee Style) */}
          {!loadingCategories && canScrollCatRight && (
            <button
              type="button"
              onClick={() => scrollCategories("right")}
              aria-label="Trượt danh mục sang phải"
              className="absolute -right-3 sm:-right-5 top-[56%] -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-lg transition-all duration-200 hover:scale-125 hover:border-primary hover:text-primary cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </section>

      {/* 3. MAIN PRODUCT CATALOG WITH SIDEBAR FILTER & TOOLBAR */}
      <section
        id="products"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 scroll-mt-20"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* LEFT SIDEBAR: BỘ LỌC CHI TIẾT (Desktop) */}
          <aside className="hidden lg:col-span-3 lg:flex lg:flex-col gap-5 sticky top-20 rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-base text-foreground">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <span>Bộ lọc tìm kiếm</span>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-medium text-primary hover:underline cursor-pointer"
                >
                  Đặt lại
                </button>
              )}
            </div>

            <Separator />

            {/* Lọc theo Danh mục */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Danh mục sản phẩm
              </h3>
              <div className="flex flex-col gap-1 max-h-[320px] overflow-y-auto pr-1">
                {loadingCategories ? (
                  Array.from({ length: 8 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl px-3 py-2"
                    >
                      <Skeleton className="h-4 w-32 rounded" />
                      <Skeleton className="h-4 w-6 rounded-full" />
                    </div>
                  ))
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSelectCategory("all")}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                        selectedCategoryId === "all"
                          ? "bg-primary/15 text-primary font-semibold"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <span>Tất cả danh mục</span>
                      {selectedCategoryId === "all" && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      )}
                    </button>
                    {categories.map((cat) => {
                      const active = selectedCategoryId === cat.id
                      const count = cat._count?.products ?? 0
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleSelectCategory(cat.id)}
                          className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors cursor-pointer ${
                            active
                              ? "bg-primary/15 text-primary font-semibold"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <span className="truncate pr-2">{cat.name}</span>
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-mono ${
                              active
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      )
                    })}
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Lọc theo Khoảng giá */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Khoảng giá
              </h3>
              <div className="flex flex-col gap-1.5">
                {PRICE_RANGES.map((range) => {
                  const active = priceRange === range.key
                  return (
                    <button
                      key={range.key}
                      type="button"
                      onClick={() => {
                        setPriceRange(range.key)
                        setPage(1)
                      }}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors cursor-pointer ${
                        active
                          ? "bg-primary/15 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <span>{range.label}</span>
                      {active && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Tình trạng kho */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tình trạng hàng
              </h3>
              <label className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => {
                    setOnlyInStock(e.target.checked)
                    setPage(1)
                  }}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                <span>Chỉ hiển thị sản phẩm còn hàng</span>
              </label>
            </div>
          </aside>

          {/* RIGHT CONTENT: TOOLBAR + PRODUCT GRID */}
          <div className="lg:col-span-9 flex flex-col gap-5">
            {/* Toolbar: Search, Category Dropdown (Mobile/Quick), Sort, Grid Switch */}
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm theo tên, mô tả..."
                    className="h-10 pl-10 pr-9 rounded-xl bg-muted/40 focus:bg-background"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Xóa từ khóa"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Category Select + Sort Select */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Bộ lọc Danh mục bằng Select */}
                  {loadingCategories ? (
                    <Skeleton className="h-10 w-full sm:w-[200px] rounded-xl" />
                  ) : (
                    <Select
                      value={
                        selectedCategoryId === "all"
                          ? "all"
                          : String(selectedCategoryId)
                      }
                      onValueChange={(val) => {
                        if (!val || val === "all") {
                          handleSelectCategory("all")
                        } else {
                          handleSelectCategory(Number(val))
                        }
                      }}
                    >
                      <SelectTrigger className="h-10 w-full sm:w-[200px] rounded-xl">
                        <SelectValue placeholder="Tất cả danh mục">
                          {(val: string | null) => {
                            if (!val || val === "all") return "Tất cả danh mục"
                            const found = categories.find(
                              (c) => String(c.id) === String(val)
                            )
                            return found ? found.name : "Tất cả danh mục"
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả danh mục</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.name} ({cat._count?.products ?? 0})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Sắp xếp */}
                  <Select
                    value={sortOption}
                    onValueChange={(val) => {
                      if (val) {
                        setSortOption(val)
                        setPage(1)
                      }
                    }}
                  >
                    <SelectTrigger className="h-10 w-full sm:w-[185px] rounded-xl">
                      <SelectValue placeholder="Sắp xếp theo">
                        {(val: string | null) =>
                          SORT_OPTIONS.find((o) => o.value === val)?.label ||
                          "Mới nhất"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Chuyển đổi số cột trên màn hình lớn */}
                  <div className="hidden xl:flex items-center rounded-xl border border-border p-1 bg-muted/30">
                    <button
                      type="button"
                      onClick={() => setGridCols(3)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        gridCols === 3
                          ? "bg-card text-primary shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Hiển thị 3 cột"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setGridCols(4)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        gridCols === 4
                          ? "bg-card text-primary shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Hiển thị 4 cột"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Thanh trạng thái kết quả & Active filter chips */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
                {loadingProducts ? (
                  <Skeleton className="h-4 w-56 rounded" />
                ) : (
                  <div>
                    Hiển thị{" "}
                    <span className="font-semibold text-foreground">
                      {products.length}
                    </span>{" "}
                    trên tổng số{" "}
                    <span className="font-semibold text-foreground">
                      {totalProducts}
                    </span>{" "}
                    sản phẩm
                    {selectedCategoryObj && (
                      <span>
                        {" "}
                        trong danh mục{" "}
                        <strong className="text-primary">
                          {selectedCategoryObj.name}
                        </strong>
                      </span>
                    )}
                  </div>
                )}

                {hasActiveFilters && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {selectedCategoryObj && (
                      <Badge
                        variant="secondary"
                        className="gap-1 pl-2.5 pr-1.5 py-0.5 text-xs font-medium"
                      >
                        <span>Danh mục: {selectedCategoryObj.name}</span>
                        <button
                          type="button"
                          onClick={() => handleSelectCategory("all")}
                          className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {priceRange !== "all" && (
                      <Badge
                        variant="secondary"
                        className="gap-1 pl-2.5 pr-1.5 py-0.5 text-xs font-medium"
                      >
                        <span>
                          {PRICE_RANGES.find((r) => r.key === priceRange)?.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPriceRange("all")}
                          className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {debouncedSearch && (
                      <Badge
                        variant="secondary"
                        className="gap-1 pl-2.5 pr-1.5 py-0.5 text-xs font-medium"
                      >
                        <span>Từ khóa: "{debouncedSearch}"</span>
                        <button
                          type="button"
                          onClick={() => setSearch("")}
                          className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-xs font-semibold text-destructive hover:underline ml-1 cursor-pointer"
                    >
                      Xóa tất cả lọc
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* PRODUCT GRID */}
            {loadingProducts ? (
              <div
                className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
                  gridCols === 4 ? "lg:grid-cols-4" : "md:grid-cols-3"
                }`}
              >
                {Array.from({ length: LIMIT }).map((_, idx) => (
                  <ProductCardSkeleton key={idx} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <Card className="border-dashed border-border bg-card/60 py-16">
                <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Package className="h-8 w-8" />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h3 className="text-lg font-bold text-foreground">
                      Không tìm thấy sản phẩm phù hợp
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Không có sản phẩm nào khớp với bộ lọc hoặc từ khóa tìm kiếm hiện tại. Hãy thử chọn danh mục khác hoặc đặt lại bộ lọc.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleResetFilters}
                    className="gap-2 rounded-xl"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Xem tất cả sản phẩm</span>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div
                className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
                  gridCols === 4 ? "lg:grid-cols-4" : "md:grid-cols-3"
                }`}
              >
                {products.map((product) => {
                  const isOutOfStock =
                    !product.isActive || product.quantity <= 0
                  const isLowStock =
                    product.isActive &&
                    product.quantity > 0 &&
                    product.quantity <= 10
                  const isWishlisted = wishlistIds.includes(product.id)
                  const numericPrice = Number(product.price) || 0
                  const originalPrice =
                    Math.round((numericPrice * 1.18) / 1000) * 1000

                  return (
                    <div
                      key={product.id}
                      onClick={() => openQuickView(product)}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl cursor-pointer"
                    >
                      {/* Product Image Area */}
                      <div>
                        <div className="relative aspect-square w-full overflow-hidden bg-muted/40">
                          {product.imageUrl ? (
                            <img
                              src={getAssetUrl(product.imageUrl)}
                              alt={product.name}
                              className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                                isOutOfStock ? "opacity-60 grayscale-[30%]" : ""
                              }`}
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                              <ShoppingBag className="h-10 w-10 stroke-[1.25]" />
                              <span className="text-xs">Chưa có ảnh</span>
                            </div>
                          )}

                          {/* Top-Left Badges */}
                          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1 items-start">
                            {isOutOfStock ? (
                              <Badge
                                variant="destructive"
                                className="rounded-lg px-2 py-0.5 text-[10px] font-semibold shadow-sm"
                              >
                                Hết hàng
                              </Badge>
                            ) : (
                              <span className="rounded-lg bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                                -15%
                              </span>
                            )}
                            {isLowStock && (
                              <span className="rounded-lg bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                                Còn {product.quantity} sp
                              </span>
                            )}
                          </div>

                          {/* Top-Right Quick Actions */}
                          <div className="absolute right-2.5 top-2.5 flex flex-col gap-1.5 opacity-100 sm:opacity-0 sm:translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
                            <button
                              type="button"
                              onClick={(e) => toggleWishlist(product, e)}
                              className={`flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-md shadow-sm transition-colors cursor-pointer ${
                                isWishlisted
                                  ? "border-rose-500 bg-rose-500 text-white"
                                  : "border-border/60 bg-background/85 text-foreground hover:bg-primary hover:text-primary-foreground"
                              }`}
                              title="Yêu thích"
                            >
                              <Heart
                                className={`h-3.5 w-3.5 ${
                                  isWishlisted ? "fill-current" : ""
                                }`}
                              />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => openQuickView(product, e)}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background/85 text-foreground backdrop-blur-md shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground cursor-pointer"
                              title="Xem nhanh"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-3.5 pb-1.5 space-y-1.5">
                          <div className="flex items-center justify-between gap-1.5 text-xs">
                            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary truncate max-w-[130px]">
                              {product.category?.name || "Thời trang"}
                            </span>
                            <span className="flex items-center gap-0.5 text-amber-500 text-[11px] font-semibold shrink-0">
                              <Star className="h-3 w-3 fill-amber-500" />
                              <span>4.9</span>
                            </span>
                          </div>

                          <h3
                            className="line-clamp-2 text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors min-h-[2.25rem] leading-snug"
                            title={product.name}
                          >
                            {product.name}
                          </h3>

                          {product.description && (
                            <p className="line-clamp-1 text-[11px] text-muted-foreground">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Price & Add to Cart Footer */}
                      <div className="p-3.5 pt-2 space-y-2.5">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-baseline justify-between gap-1">
                            <span className="text-sm sm:text-base font-extrabold text-primary tabular-nums">
                              {formatVND(numericPrice)}
                            </span>
                            <span className="text-[10px] text-muted-foreground tabular-nums">
                              Kho: {product.quantity}
                            </span>
                          </div>
                          {numericPrice > 0 && (
                            <span className="text-[11px] text-muted-foreground line-through tabular-nums">
                              {formatVND(originalPrice)}
                            </span>
                          )}
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          disabled={isOutOfStock}
                          onClick={(e) => handleAddToCart(product, 1, e)}
                          className="w-full gap-1.5 rounded-xl font-semibold shadow-xs cursor-pointer h-9 text-xs"
                          variant={isOutOfStock ? "secondary" : "default"}
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          <span>
                            {isOutOfStock ? "Tạm hết hàng" : "Thêm vào giỏ"}
                          </span>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="gap-1 rounded-xl"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Trước</span>
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="h-8 w-8 rounded-xl p-0 font-semibold"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="gap-1 rounded-xl"
                >
                  <span>Sau</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. GEN.G CHAMPIONSHIP COLLECTION PROMO BANNER */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-[#d4af37]/35 bg-[#09090b] text-white shadow-2xl">
          <img
            src={gengHero}
            alt="Gen.G Esports Roster"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-25 mix-blend-luminosity"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/90 to-[#1a1405]/80" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-[#d4af37]/20 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 items-center gap-8 p-6 sm:p-10 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#f5d061]">
                <Tag className="h-3.5 w-3.5 text-[#f5d061]" />
                <span>Ưu đãi đặc biệt • 2026 LCK Cup Champions</span>
              </div>

              <div className="flex items-center gap-3.5">
                <img
                  src={gengLogo}
                  alt="Gen.G Logo"
                  className="h-12 w-12 rounded-xl border border-[#d4af37]/40 object-cover shadow-md"
                />
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Sở hữu ngay{" "}
                  <span className="bg-gradient-to-r from-[#fff3b0] via-[#f5d061] to-[#d4af37] bg-clip-text text-transparent">
                    TIGER NATION PRO KIT
                  </span>
                </h2>
              </div>

              <p className="max-w-2xl text-sm text-zinc-300 leading-relaxed">
                Đồng hành cùng nhà vô địch{" "}
                <span className="font-semibold text-[#f5d061]">
                  KIIN • CANYON • CHOVY • RULER • DURO
                </span>
                . Nhập mã{" "}
                <span className="rounded-md border border-[#d4af37]/50 bg-[#d4af37]/20 px-2 py-0.5 font-mono font-bold text-[#f5d061]">
                  GENG2026
                </span>{" "}
                để giảm ngay 20% cho toàn bộ đơn hàng thời trang & phụ kiện hôm nay.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a href="#products">
                  <Button
                    size="lg"
                    className="gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f5d061] to-[#b88917] text-[#09090b] hover:opacity-95 font-extrabold shadow-lg shadow-[#d4af37]/25 border-0 cursor-pointer"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Mua ngay bộ sưu tập</span>
                  </Button>
                </a>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    navigator.clipboard?.writeText("GENG2026")
                    toast.success("Đã sao chép mã giảm giá GENG2026!")
                  }}
                  className="rounded-xl border-[#d4af37]/45 bg-white/5 text-[#f5d061] hover:bg-[#d4af37]/15 hover:text-[#fff3b0] cursor-pointer"
                >
                  Sao chép mã: GENG2026
                </Button>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[260px] overflow-hidden rounded-2xl border-2 border-[#d4af37]/50 shadow-xl shadow-black/60 group">
                <img
                  src={gengChamps}
                  alt="2026 LCK Cup Champs Poster"
                  className="h-56 w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 text-center">
                  <span className="text-[11px] font-extrabold tracking-widest uppercase text-[#f5d061]">
                    #TIGERNATION • #GENGWIN
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. QUICK VIEW PRODUCT MODAL */}
      <Dialog
        open={!!quickViewProduct}
        onOpenChange={(open) => {
          if (!open) setQuickViewProduct(null)
        }}
      >
        <DialogContent className="sm:max-w-3xl w-[94vw] max-h-[90vh] overflow-y-auto p-6">
          {quickViewProduct && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12 items-start">
              {/* Left Product Image */}
              <div className="md:col-span-5 overflow-hidden rounded-2xl border border-border bg-muted/30 aspect-square flex items-center justify-center">
                {quickViewProduct.imageUrl ? (
                  <img
                    src={getAssetUrl(quickViewProduct.imageUrl)}
                    alt={quickViewProduct.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ShoppingBag className="h-16 w-16 text-muted-foreground stroke-[1.2]" />
                )}
              </div>

              {/* Right Product Details */}
              <div className="md:col-span-7 flex flex-col gap-4">
                <DialogHeader className="space-y-2 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="default" className="text-xs">
                      {quickViewProduct.category?.name || "Chưa phân loại"}
                    </Badge>
                    {quickViewProduct.isActive &&
                    quickViewProduct.quantity > 0 ? (
                      <Badge
                        variant="secondary"
                        className="text-xs text-primary font-semibold"
                      >
                        Còn hàng ({quickViewProduct.quantity} sản phẩm)
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Hết hàng
                      </Badge>
                    )}
                  </div>

                  <DialogTitle className="text-xl font-bold text-foreground leading-snug">
                    {quickViewProduct.name}
                  </DialogTitle>
                  <DialogDescription className="font-mono text-xs text-muted-foreground">
                    Mã SP: #{quickViewProduct.id} • /{quickViewProduct.slug}
                  </DialogDescription>
                </DialogHeader>

                <div className="flex items-baseline gap-3 rounded-2xl bg-muted/50 p-4">
                  <span className="text-2xl font-extrabold text-primary tabular-nums">
                    {formatVND(quickViewProduct.price)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through tabular-nums">
                    {formatVND(
                      Math.round((Number(quickViewProduct.price) * 1.18) / 1000) *
                        1000
                    )}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Mô tả sản phẩm
                  </h4>
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                    {quickViewProduct.description ||
                      "Sản phẩm chính hãng chất lượng cao, được tuyển chọn kỹ lưỡng tại VibeStore."}
                  </p>
                </div>

                <Separator />

                {/* Quantity & Add to Cart */}
                {quickViewProduct.isActive && quickViewProduct.quantity > 0 ? (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center border border-border rounded-xl bg-card w-fit">
                      <button
                        type="button"
                        onClick={() =>
                          setQuickViewQty((q) => Math.max(1, q - 1))
                        }
                        className="p-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 text-sm font-bold tabular-nums">
                        {quickViewQty}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuickViewQty((q) =>
                            Math.min(quickViewProduct.quantity, q + 1)
                          )
                        }
                        className="p-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <Button
                      size="lg"
                      onClick={() => {
                        handleAddToCart(quickViewProduct, quickViewQty)
                        setQuickViewProduct(null)
                      }}
                      className="flex-1 gap-2 rounded-xl font-semibold shadow-md shadow-primary/20 cursor-pointer"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>
                        Thêm vào giỏ •{" "}
                        {formatVND(
                          (Number(quickViewProduct.price) || 0) * quickViewQty
                        )}
                      </span>
                    </Button>
                  </div>
                ) : (
                  <Button disabled size="lg" variant="secondary" className="w-full rounded-xl">
                    Sản phẩm hiện đang tạm hết hàng
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
