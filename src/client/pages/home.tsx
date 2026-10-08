import { Link } from "react-router-dom"
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Users,
  CheckCircle2,
  Star,
  Terminal,
  Layers,
  ShieldCheck,
  Cpu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"

export default function HomePage() {
  const { user, isAuthenticated } = useAuth()
  const stats = [
    { label: "Học viên đăng ký", value: "25,000+" },
    { label: "Khóa học chất lượng", value: "60+" },
    { label: "Dự án thực chiến", value: "150+" },
    { label: "Đánh giá 5 sao", value: "98.5%" },
  ]

  const featuredCourses = [
    {
      id: 1,
      title: "React 19 & TypeScript Hiện Đại",
      category: "Frontend",
      level: "Trung cấp",
      students: "6,420",
      rating: "4.9",
      desc: "Nắm vững React 19 mới nhất, Hooks chuyên sâu, Server Components và tối ưu hiệu năng toàn diện.",
      tag: "Hot nhất",
    },
    {
      id: 2,
      title: "Xây Dựng Backend Chuẩn REST & GraphQL",
      category: "Backend",
      level: "Cơ bản - Nâng cao",
      students: "4,180",
      rating: "4.8",
      desc: "Làm chủ Node.js, Express, cơ sở dữ liệu quan hệ và NoSQL, kiến trúc microservices và xác thực JWT.",
      tag: "Bán chạy",
    },
    {
      id: 3,
      title: "Fullstack Web App với Next.js & Tailwind",
      category: "Fullstack",
      level: "Thực chiến",
      students: "8,950",
      rating: "5.0",
      desc: "Xây dựng các sản phẩm thương mại điện tử, dashboard quản trị và ứng dụng SaaS từ con số 0 đến deploy.",
      tag: "Mới cập nhật",
    },
  ]

  const features = [
    {
      icon: Terminal,
      title: "Lập trình thực chiến (Project-Driven)",
      desc: "Không chỉ lý thuyết suông, bạn sẽ bắt tay xây dựng các ứng dụng hoàn chỉnh từ ngày đầu tiên.",
    },
    {
      icon: Cpu,
      title: "Ứng dụng AI vào quy trình Code",
      desc: "Học cách tận dụng các mô hình AI tiên tiến để debug, viết tests và tăng tốc độ phát triển gấp nhiều lần.",
    },
    {
      icon: Layers,
      title: "Giao diện hiện đại & Đa nền tảng",
      desc: "Thiết kế chuẩn UI/UX, hỗ trợ Dark / Light Theme mượt mà trên mọi kích cỡ màn hình thiết bị.",
    },
    {
      icon: Users,
      title: "Cộng đồng hỗ trợ tích cực",
      desc: "Giải đáp thắc mắc 24/7 cùng đội ngũ mentor nhiệt tình và hàng ngàn lập trình viên khác.",
    },
  ]

  return (
    <div className="space-y-16 py-8 md:space-y-24 md:py-12">
      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Decorative backdrop */}
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
          <div className="h-72 w-72 translate-x-48 -translate-y-12 rounded-full bg-accent/30 blur-2xl" />
        </div>

        <div className="mx-auto max-w-3xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            <span>
              {isAuthenticated && user
                ? `Xin chào, ${user.username}! Chúc bạn học tập hiệu quả`
                : "Nền tảng học lập trình thế hệ mới 2026"}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl sm:leading-tight">
            Khơi nguồn cảm hứng code với{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              VibeCoding
            </span>
          </h1>

          <p className="text-base text-muted-foreground sm:text-lg leading-relaxed">
            Học lập trình theo lộ trình bài bản, thực chiến cùng các dự án thực tế.
            Trải nghiệm nền tảng hiện đại với chế độ Sáng / Tối tối ưu thị giác cho lập trình viên.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {isAuthenticated && user ? (
              <>
                <a href="#courses">
                  <Button size="lg" className="gap-2 shadow-lg shadow-primary/25 font-semibold">
                    <span>Khám phá khóa học</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
                {user.role?.toUpperCase() === "ADMIN" && (
                  <Link to="/admin">
                    <Button variant="secondary" size="lg" className="gap-2 font-semibold">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <span>Trang quản trị (Admin)</span>
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button size="lg" className="gap-2 shadow-lg shadow-primary/25 font-semibold">
                    <span>Đăng nhập ngay</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Quick trust metrics */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Miễn phí đăng ký</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Hỗ trợ Theme Sáng / Tối</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Chứng chỉ sau khóa học</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm md:grid-cols-4 md:p-8">
          {stats.map((item) => (
            <div key={item.label} className="text-center">
              <div className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                {item.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm font-medium">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Tại sao nên chọn VibeCoding?
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Chúng tôi xây dựng môi trường học tập tối ưu, giúp bạn nhanh chóng biến ý tưởng thành sản phẩm phần mềm thực tế.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => (
            <Card key={idx} className="border-border/70 bg-card transition-all hover:border-primary/50 hover:shadow-md">
              <CardContent className="space-y-3 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Courses Section */}
      <section id="courses" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              <BookOpen className="h-4 w-4" />
              <span>Khóa học nổi bật</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Chinh phục công nghệ hot nhất
            </h2>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <span>Xem tất cả khóa học</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {featuredCourses.map((course) => (
            <Card key={course.id} className="flex flex-col justify-between border-border bg-card transition-all hover:shadow-lg">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                    {course.category}
                  </span>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    {course.tag}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {course.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {course.students} học viên
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    {course.rating}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-8 md:p-12">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Sẵn sàng gia nhập cộng đồng VibeCoding?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tạo tài khoản chỉ mất chưa đầy 30 giây để bắt đầu học lập trình và trao đổi kỹ thuật với hàng nghìn thành viên khác.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/register">
                <Button size="default" className="gap-2 shadow-sm shadow-primary/20">
                  <span>Đăng ký tài khoản ngay</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="default">
                  <span>Đã có tài khoản? Đăng nhập</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
