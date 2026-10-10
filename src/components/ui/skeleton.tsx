import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md bg-muted/80 dark:bg-muted/60",
        className
      )}
      {...props}
    />
  )
}

/**
 * Skeleton cho 1 thẻ Sản phẩm trên trang chủ E-commerce
 */
function ProductCardSkeleton() {
  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-2xs">
      <div>
        {/* Ảnh sản phẩm vuông 1:1 + Badges + Nút yêu thích */}
        <div className="relative aspect-square w-full bg-muted/30 p-3">
          <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
          <div className="relative z-10 flex items-start justify-between">
            <Skeleton className="h-5 w-12 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>

        {/* Nội dung thông tin sản phẩm */}
        <div className="p-3.5 space-y-2.5">
          {/* Hàng Danh mục & Trạng thái kho */}
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-3.5 w-14 rounded" />
          </div>

          {/* Tên sản phẩm (2 dòng) */}
          <div className="space-y-1.5 py-0.5">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>

          {/* Đánh giá sao & Đã bán */}
          <div className="flex items-center gap-2 pt-0.5">
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-3.5 w-14 rounded" />
          </div>
        </div>
      </div>

      {/* Giá tiền & Nút thêm vào giỏ */}
      <div className="px-3.5 pb-3.5 pt-1 space-y-3">
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-5 w-24 rounded" />
          <Skeleton className="h-3.5 w-16 rounded" />
        </div>
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </div>
  )
}

/**
 * Skeleton cho Lưới Danh mục 2 hàng kiểu Shopee
 */
function ShopeeCategoryGridSkeleton({ count = 14 }: { count?: number }) {
  return (
    <div className="grid grid-rows-2 grid-flow-col auto-cols-[33.3333%] sm:auto-cols-[25%] md:auto-cols-[16.6667%] lg:auto-cols-[14.2857%] overflow-hidden">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex flex-col items-center justify-start border-r border-b border-border/60 px-2.5 py-4"
        >
          <Skeleton className="mb-2.5 h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-full" />
          <Skeleton className="h-3.5 w-20 rounded mb-1" />
          <Skeleton className="h-3 w-12 rounded" />
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton toàn trang Quản trị (Admin Layout + Sidebar + Header + Bảng dữ liệu)
 * Dùng khi khởi tạo phiên đăng nhập Admin hoặc tải trang lần đầu
 */
function AdminLayoutSkeleton() {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar Skeleton */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/50 p-4 justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-2 py-1">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-5 w-28 rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-16 rounded mx-2 mb-3" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 flex-1 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-2 py-2 border-t border-border pt-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-3 w-14 rounded" />
          </div>
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header Skeleton */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card/80 px-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-9 w-64 rounded-md hidden sm:block" />
          </div>
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </header>

        {/* Body Content Skeleton */}
        <main className="flex-1 p-4 md:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-9 w-36 rounded-lg" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
                <Skeleton className="h-7 w-32 rounded" />
                <Skeleton className="h-3 w-28 rounded" />
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <Skeleton className="h-6 w-48 rounded" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

/**
 * Skeleton cho Form Đăng nhập / Đăng ký khi đang kiểm tra phiên hoặc tải trang lần đầu
 */
function AuthCardSkeleton({ fields = 2 }: { fields?: number }) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <Skeleton className="h-6 w-44 rounded-full" />
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-3.5 w-64 rounded" />
          </div>

          <div className="space-y-4">
            {Array.from({ length: fields }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3.5 w-28 rounded" />
                  <Skeleton className="h-3 w-14 rounded" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>

          <Skeleton className="h-10 w-full rounded-lg" />

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

export {
  Skeleton,
  ProductCardSkeleton,
  ShopeeCategoryGridSkeleton,
  AdminLayoutSkeleton,
  AuthCardSkeleton,
}
