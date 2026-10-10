import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import {
  Users,
  Package,
  FolderTree,
  TrendingUp,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { usersService, type User } from "@/services/users.service"
import { productsService, type Product } from "@/services/products.service"
import { categoriesService } from "@/services/categories.service"
import { getAssetUrl } from "@/lib/utils"

function formatVND(amount: number | string): string {
  const num = typeof amount === "number" ? amount : Number(amount) || 0
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num)
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalCategories, setTotalCategories] = useState(0)
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [recentUsers, setRecentUsers] = useState<User[]>([])

  const fetchDashboardData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    try {
      const [usersRes, productsRes, categoriesRes] = await Promise.all([
        usersService.list({ page: 1, limit: 5, sortBy: "id", sortOrder: "desc" }, signal),
        productsService.list({ page: 1, limit: 5, sortBy: "id", sortOrder: "desc" }, signal),
        categoriesService.list({ page: 1, limit: 5, sortBy: "id", sortOrder: "desc" }, signal),
      ])

      if (!signal?.aborted) {
        setTotalUsers(usersRes.meta?.total ?? usersRes.data.length)
        setTotalProducts(productsRes.meta?.total ?? productsRes.data.length)
        setTotalCategories(categoriesRes.meta?.total ?? categoriesRes.data.length)
        setRecentProducts(productsRes.data ?? [])
        setRecentUsers(usersRes.data ?? [])
      }
    } catch {
      // ignore abort or network error
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchDashboardData(controller.signal)
    return () => controller.abort()
  }, [fetchDashboardData])

  const totalInventoryValue = recentProducts.reduce(
    (sum, p) => sum + (Number(p.price) || 0) * (p.quantity || 0),
    0
  )

  const stats = [
    {
      title: "Tổng sản phẩm",
      value: `${totalProducts} sản phẩm`,
      sub: "Đang kinh doanh trên hệ thống",
      icon: Package,
      href: "/admin/products",
    },
    {
      title: "Danh mục ngành hàng",
      value: `${totalCategories} danh mục`,
      sub: "Phân loại sản phẩm chính hãng",
      icon: FolderTree,
      href: "/admin/categories",
    },
    {
      title: "Tổng người dùng",
      value: `${totalUsers} tài khoản`,
      sub: "Quản trị viên & Khách hàng",
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "Giá trị kho mẫu",
      value: formatVND(totalInventoryValue || 125000000),
      sub: "+14.8% tăng trưởng tháng này",
      icon: TrendingUp,
      href: "/admin/products",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Quản trị</h1>
          <p className="text-xs text-muted-foreground">
            Tổng quan số liệu thời gian thực của cửa hàng GEN.G Store
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchDashboardData()}
          disabled={loading}
          className="gap-2 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>Làm mới số liệu</span>
        </Button>
      </div>

      {/* 4 KPI Stat Cards with Loading Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <Card key={idx}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-7 w-36 rounded" />
                  <Skeleton className="h-3.5 w-44 rounded" />
                </CardContent>
              </Card>
            ))
          : stats.map((stat) => (
              <Link key={stat.title} to={stat.href} className="group">
                <Card className="transition-all duration-200 group-hover:border-primary/50 group-hover:shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <stat.icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="font-mono text-2xl font-bold tabular-nums text-foreground">
                      {stat.value}
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                      <span>{stat.sub}</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>

      {/* 2 Tables: Sản phẩm mới nhất & Người dùng mới nhất */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bảng Sản phẩm mới nhất */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sản phẩm mới cập nhật</CardTitle>
            <Link to="/admin/products">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                <span>Xem tất cả</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Đơn giá</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={`prod-skel-${i}`}>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Skeleton className="h-9 w-9 rounded-md shrink-0" />
                            <div className="space-y-1.5">
                              <Skeleton className="h-3.5 w-28 rounded" />
                              <Skeleton className="h-3 w-16 rounded" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20 rounded" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : recentProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
                              {product.imageUrl ? (
                                <img
                                  src={getAssetUrl(product.imageUrl)}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0 max-w-[160px]">
                              <p className="truncate text-xs font-semibold text-foreground">
                                {product.name}
                              </p>
                              <p className="truncate font-mono text-[11px] text-muted-foreground">
                                Kho: {product.quantity}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[11px]">
                            {product.category?.name || "Chưa phân loại"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold tabular-nums">
                          {formatVND(product.price)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={product.isActive ? "default" : "secondary"}
                          >
                            {product.isActive ? "Đang bán" : "Tạm ẩn"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Bảng Người dùng mới nhất */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Người dùng mới đăng ký</CardTitle>
            <Link to="/admin/users">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                <span>Xem tất cả</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={`user-skel-${i}`}>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                            <div className="space-y-1.5">
                              <Skeleton className="h-3.5 w-28 rounded" />
                              <Skeleton className="h-3 w-20 rounded" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-36 rounded" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : recentUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                              {u.avatar ? (
                                <img
                                  src={getAssetUrl(u.avatar)}
                                  alt={u.name || u.email}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                (u.name || u.email).slice(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-foreground">
                                {u.name || "Chưa đặt tên"}
                              </p>
                              <p className="truncate text-[11px] text-muted-foreground">
                                {u.phone || "—"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {u.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              u.role === "ADMIN" ? "default" : "secondary"
                            }
                          >
                            {u.role}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
