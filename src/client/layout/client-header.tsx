import { useState, useRef, useEffect } from "react"
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import {
  ShoppingBag,
  ShoppingCart,
  Menu,
  X,
  Search,
  LogIn,
  LogOut,
  ShieldCheck,
  Compass,
  FolderTree,
  Flame,
  Trash2,
  Plus,
  Minus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"
import { getAssetUrl } from "@/lib/utils"
import { toast } from "react-toastify"
import gengLogo from "@/assets/geng-logo.png"

function formatVND(amount: number | string): string {
  const num = typeof amount === "number" ? amount : Number(amount) || 0
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num)
}

export default function ClientHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [cartDialogOpen, setCartDialogOpen] = useState(false)
  const userDropdownRef = useRef<HTMLDivElement>(null)

  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [headerSearch, setHeaderSearch] = useState(
    () => searchParams.get("search") || ""
  )

  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } =
    useCart()

  useEffect(() => {
    setHeaderSearch(searchParams.get("search") || "")
  }, [searchParams])

  // Handle clicking outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setUserDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const navLinks = [
    { title: "Trang chủ", href: "/home", icon: Compass },
    { title: "Danh mục", href: "/home#categories", icon: FolderTree },
    { title: "Sản phẩm", href: "/home#products", icon: ShoppingBag },
    { title: "Khuyến mãi", href: "/home#products", icon: Flame },
  ]

  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const nextParams = new URLSearchParams(searchParams)
    if (headerSearch.trim()) {
      nextParams.set("search", headerSearch.trim())
    } else {
      nextParams.delete("search")
    }
    navigate(`/home?${nextParams.toString()}#products`)
    setMobileMenuOpen(false)
  }

  const handleLogout = () => {
    setUserDropdownOpen(false)
    logout()
    toast.info("Đã đăng xuất tài khoản.")
  }

  const avatarLetter = user?.username
    ? user.username.trim().charAt(0).toUpperCase()
    : "U"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <Link
            to="/home"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-primary/40 bg-[#09090b] shadow-sm shadow-primary/20 transition-transform group-hover:scale-105">
              <img
                src={gengLogo}
                alt="Gen.G Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
                GEN.G <span className="text-primary">Store</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider leading-none text-muted-foreground">
                Tiger Nation Shop
              </span>
            </div>
          </Link>

          {/* Navigation Links for Desktop */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((item) => {
              const isHomeActive =
                item.href === "/home" &&
                (location.pathname === "/home" || location.pathname === "/") &&
                !location.hash
              return (
                <a
                  key={item.title}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isHomeActive
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </a>
              )
            })}
          </nav>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleHeaderSearchSubmit}
          className="hidden max-w-xs flex-1 px-4 lg:block"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              placeholder="Tìm áo thun, giày sneaker, balo..."
              className="h-9 w-full rounded-full bg-muted/60 pl-8 pr-8 text-xs placeholder:text-muted-foreground focus:bg-background"
            />
            {headerSearch && (
              <button
                type="button"
                onClick={() => {
                  setHeaderSearch("")
                  navigate("/home")
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick link to Admin page (Only for ADMIN role) */}
          {user?.role?.toUpperCase() === "ADMIN" && (
            <Link to="/admin" className="hidden sm:inline-flex">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>Admin Panel</span>
              </Button>
            </Link>
          )}

          {/* Shopping Cart Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCartDialogOpen(true)}
            className="relative gap-1.5 rounded-full px-3 cursor-pointer"
            aria-label="Giỏ hàng"
          >
            <ShoppingCart className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline text-xs font-medium">Giỏ hàng</span>
            {totalItems > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground tabular-nums">
                {totalItems}
              </span>
            )}
          </Button>

          {/* Theme Toggle */}
          <div className="flex items-center border-l border-border/70 pl-2">
            <ThemeToggle />
          </div>

          {/* User Auth Section */}
          <div className="hidden items-center gap-2 sm:flex">
            {authLoading ? (
              <Skeleton className="h-9 w-9 rounded-full" />
            ) : isAuthenticated && user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-primary/30 hover:ring-primary/70 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer select-none"
                  aria-label="Tài khoản người dùng"
                  aria-expanded={userDropdownOpen}
                >
                  <Avatar className="h-9 w-9 rounded-full pointer-events-none">
                    <AvatarFallback className="bg-primary font-bold text-xs text-primary-foreground">
                      {avatarLetter}
                    </AvatarFallback>
                  </Avatar>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-xl shadow-black/10 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-border/70 mb-1">
                      <p className="text-[11px] font-medium text-muted-foreground">
                        Tài khoản đã đăng nhập
                      </p>
                      <p className="font-semibold text-foreground text-sm truncate">
                        {user.username}
                      </p>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <Link
                        to="/home"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <Compass className="h-4 w-4 text-muted-foreground" />
                        <span>Trang chủ cửa hàng</span>
                      </Link>

                      {user.role?.toUpperCase() === "ADMIN" && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <ShieldCheck className="h-4 w-4 text-primary" />
                          <span>Trang quản trị (Admin)</span>
                        </Link>
                      )}
                    </div>

                    <div className="my-1 border-t border-border/70" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button
                  variant={
                    location.pathname === "/login" ? "secondary" : "default"
                  }
                  size="sm"
                  className="gap-1.5 shadow-sm shadow-primary/20"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Đăng nhập</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-card px-4 py-4 md:hidden animate-in slide-in-from-top-2">
          {isAuthenticated && user && (
            <div className="mb-3 flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                  {avatarLetter}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs text-muted-foreground">Đang đăng nhập:</p>
                <p className="font-semibold text-foreground text-sm truncate">
                  {user.username}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleHeaderSearchSubmit} className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="h-9 w-full bg-muted/60 pl-9 text-xs"
            />
          </form>

          <nav className="flex flex-col gap-1 pb-3">
            {navLinks.map((item) => (
              <NavLink
                key={item.title}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                <item.icon className="h-4 w-4 text-primary" />
                <span>{item.title}</span>
              </NavLink>
            ))}
            {user?.role?.toUpperCase() === "ADMIN" && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Khu vực Quản trị (Admin)</span>
              </Link>
            )}
          </nav>

          <div className="border-t border-border pt-3">
            {isAuthenticated && user ? (
              <Button
                variant="destructive"
                size="sm"
                className="w-full gap-1.5"
                onClick={() => {
                  handleLogout()
                  setMobileMenuOpen(false)
                }}
              >
                <LogOut className="h-4 w-4" />
                <span>Đăng xuất</span>
              </Button>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full gap-1.5">
                  <LogIn className="h-4 w-4" />
                  <span>Đăng nhập</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Shopping Cart Modal */}
      <Dialog open={cartDialogOpen} onOpenChange={setCartDialogOpen}>
        <DialogContent className="sm:max-w-lg w-[94vw] max-h-[88vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <span>Giỏ hàng của bạn ({totalItems})</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Kiểm tra danh sách sản phẩm trước khi tiến hành đặt hàng
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-2" />

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Giỏ hàng của bạn đang trống
              </p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Hãy khám phá các sản phẩm nổi bật tại trang chủ để thêm vào giỏ hàng nhé!
              </p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[50vh]">
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-card">
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
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {product.name}
                      </p>
                      <p className="text-xs font-bold text-primary tabular-nums mt-0.5">
                        {formatVND(product.price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 rounded-lg border border-border bg-card">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(product.id, quantity - 1)
                        }
                        className="p-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-2 text-xs font-bold tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(product.id, quantity + 1)
                        }
                        className="p-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive cursor-pointer"
                      title="Xóa khỏi giỏ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <Separator className="my-2" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Tổng cộng tạm tính:
                  </span>
                  <span className="text-lg font-extrabold text-primary tabular-nums">
                    {formatVND(totalPrice)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearCart}
                    className="rounded-xl text-xs"
                  >
                    Xóa giỏ hàng
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      toast.success(
                        "Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại VibeStore."
                      )
                      clearCart()
                      setCartDialogOpen(false)
                    }}
                    className="flex-1 rounded-xl font-semibold"
                  >
                    Thanh toán ngay
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </header>
  )
}
