import { useState, useRef, useEffect } from "react"
import { Outlet, NavLink, useLocation, Link, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  FolderTree,
  Package,
  ClipboardList,
  Settings,
  Bell,
  Search,
  LogOut,
  Home,
  Compass,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "react-toastify"
import gengLogo from "@/assets/geng-logo.png"

const navItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Người dùng", url: "/admin/users", icon: Users },
  { title: "Danh mục", url: "/admin/categories", icon: FolderTree },
  { title: "Sản phẩm", url: "/admin/products", icon: Package },
  { title: "Đơn hàng", url: "/admin/orders", icon: ClipboardList },
  { title: "Cài đặt", url: "/admin/settings", icon: Settings },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const userDropdownRef = useRef<HTMLDivElement>(null)

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

  const handleLogout = () => {
    setUserDropdownOpen(false)
    logout()
    toast.info("Đã đăng xuất tài khoản.")
    navigate("/login")
  }

  const avatarText = user?.username
    ? user.username.trim().charAt(0).toUpperCase()
    : "A"

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2.5 overflow-hidden px-2 py-1.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-sidebar-primary/40 bg-[#09090b]">
              <img
                src={gengLogo}
                alt="Gen.G Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="truncate font-display text-sm font-extrabold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              GEN.G
              <span className="text-sidebar-primary"> Admin</span>
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive = item.end
                    ? location.pathname === item.url
                    : location.pathname.startsWith(item.url)

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActive}
                        className="relative data-active:before:absolute data-active:before:top-1.5 data-active:before:bottom-1.5 data-active:before:left-0 data-active:before:w-0.5 data-active:before:rounded-full data-active:before:bg-sidebar-primary"
                        render={
                          <NavLink to={item.url} end={item.end}>
                            <item.icon />
                            <span>{item.title}</span>
                          </NavLink>
                        }
                      />
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center justify-between overflow-hidden px-2 py-1.5">
            <div className="flex items-center gap-2 overflow-hidden">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground font-semibold text-xs">
                  {avatarText}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col text-sm group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium leading-none text-sidebar-foreground">
                  {user?.username || "Admin"}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/60">
                  {user?.role || "ADMIN"}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 group-data-[collapsible=icon]:hidden"
              onClick={handleLogout}
              title="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-card/80 backdrop-blur-md px-4 shadow-2xs">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Tìm kiếm..." className="pl-8" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/home">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Về Trang chủ</span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" aria-label="Thông báo">
              <Bell className="h-4 w-4 text-muted-foreground" />
            </Button>
            <ThemeToggle />
            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Admin Avatar Dropdown Menu */}
            <div className="relative" ref={userDropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-primary/30 hover:ring-primary/70 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer select-none"
                aria-label="Tài khoản quản trị"
                aria-expanded={userDropdownOpen}
              >
                <Avatar className="h-9 w-9 rounded-full pointer-events-none">
                  <AvatarFallback className="bg-primary font-bold text-xs text-primary-foreground">
                    {avatarText}
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
                      {user?.username || "Admin"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <Link
                      to="/home"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <Compass className="h-4 w-4 text-primary" />
                      <span>Trang chủ cửa hàng</span>
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
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  )
}
