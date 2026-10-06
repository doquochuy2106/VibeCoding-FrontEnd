import { useState, useRef, useEffect } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import {
  Code2,
  Menu,
  X,
  Search,
  LogIn,
  LogOut,
  ShieldCheck,
  Compass,
  BookOpen,
  MessageSquareCode,
  Laptop
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "react-toastify"

export default function ClientHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const userDropdownRef = useRef<HTMLDivElement>(null)

  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()

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
    { title: "Khóa học", href: "#courses", icon: BookOpen },
    { title: "Lộ trình học", href: "#paths", icon: Laptop },
    { title: "Cộng đồng", href: "#community", icon: MessageSquareCode },
  ]

  const handleLogout = () => {
    setUserDropdownOpen(false)
    logout()
    toast.info("Đã đăng xuất tài khoản.")
  }

  // Get first letter for avatar
  const avatarLetter = user?.username ? user.username.trim().charAt(0).toUpperCase() : "U"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <Link
            to="/home"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20 transition-transform group-hover:scale-105">
              <Code2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-tight text-foreground">
                Vibe<span className="text-primary">Coding</span>
              </span>
              <span className="text-[10px] font-medium leading-none text-muted-foreground">
                Learn & Code
              </span>
            </div>
          </Link>

          {/* Hardcoded Navigation Links for Desktop */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((item) => {
              const isHomeActive =
                item.href === "/home" &&
                (location.pathname === "/home" || location.pathname === "/")
              return (
                <NavLink
                  key={item.title}
                  to={item.href}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isHomeActive
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Search Bar (Hardcoded Mock) */}
        <div className="hidden max-w-xs flex-1 px-4 lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm kiếm khóa học, bài viết..."
              className="h-9 w-full rounded-full bg-muted/60 pl-8 pr-12 text-xs placeholder:text-muted-foreground focus:bg-background"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick link to Admin page */}
          <Link to="/admin" className="hidden sm:inline-flex">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin Panel</span>
            </Button>
          </Link>

          {/* Theme Toggle - User requirement to switch dark/light */}
          <div className="flex items-center border-l border-border/70 pl-2">
            <ThemeToggle />
          </div>

          {/* User Auth Section */}
          <div className="hidden items-center gap-2 sm:flex">
            {isAuthenticated && user ? (
              /* When logged in: Display rounded avatar ONLY; click to open popup with logout option */
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

                {/* Dropdown Menu Popup */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-xl shadow-black/10 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-border/70 mb-1">
                      <p className="text-[11px] font-medium text-muted-foreground">Tài khoản đã đăng nhập</p>
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
                        <span>Trang chủ</span>
                      </Link>

                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <span>Trang quản trị (Admin)</span>
                      </Link>
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
              /* When not logged in: ONLY show "Đăng nhập" button */
              <Link to="/login">
                <Button
                  variant={location.pathname === "/login" ? "secondary" : "default"}
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
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              className="h-9 w-full bg-muted/60 pl-9 text-xs"
            />
          </div>

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
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Khu vực Quản trị (Admin)</span>
            </Link>
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
              /* Only Đăng nhập button on mobile as well */
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
    </header>
  )
}
