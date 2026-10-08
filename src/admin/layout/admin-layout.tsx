import { Outlet, NavLink, useLocation, Link, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Package,
  Settings,
  Bell,
  Search,
  LogOut,
  Home,
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

const navItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Người dùng", url: "/admin/users", icon: Users },
  { title: "Sản phẩm", url: "/admin/products", icon: Package },
  { title: "Cài đặt", url: "/admin/settings", icon: Settings },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    toast.info("Đã đăng xuất tài khoản.")
    navigate("/login")
  }

  const avatarText = user?.username ? user.username.slice(0, 2).toUpperCase() : "AD"

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 overflow-hidden px-2 py-1.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary font-mono text-sm font-semibold text-sidebar-primary-foreground">
              {"›_"}
            </div>
            <span className="truncate font-display text-sm font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              VibeCoding
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
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs font-semibold">{avatarText}</AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </Button>
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
