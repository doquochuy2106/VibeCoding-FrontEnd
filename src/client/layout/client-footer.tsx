import { Link } from "react-router-dom"
import { Code2, Heart, Mail, Globe } from "lucide-react"

export default function ClientFooter() {
  return (
    <footer className="border-t border-border bg-card/50 text-foreground transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Col 1: Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <Link to="/home" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                <Code2 className="h-4 w-4" />
              </div>
              <span className="font-display text-base font-bold">
                Vibe<span className="text-primary">Coding</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Nền tảng chia sẻ kiến thức và học lập trình thực chiến. Vibe coding, kiến tạo tương lai cùng công nghệ hiện đại.
            </p>
            <div className="flex items-center gap-3 pt-2 text-muted-foreground text-xs">
              <span className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                <Globe className="h-3.5 w-3.5" />
                <span>vibecoding.vn</span>
              </span>
              <span className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                <Mail className="h-3.5 w-3.5" />
                <span>support</span>
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Khám phá
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link to="/home" className="text-muted-foreground hover:text-foreground transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <a href="#courses" className="text-muted-foreground hover:text-foreground transition-colors">
                  Khóa học Frontend & Backend
                </a>
              </li>
              <li>
                <a href="#paths" className="text-muted-foreground hover:text-foreground transition-colors">
                  Lộ trình Fullstack
                </a>
              </li>
              <li>
                <a href="#blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Bài viết & Thủ thuật
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Tài khoản & Hệ thống */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tài khoản
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  Đăng nhập
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-muted-foreground hover:text-foreground transition-colors">
                  Đăng ký tài khoản mới
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                  Bảng quản trị Admin
                </Link>
              </li>
              <li>
                <a href="#privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Hỗ trợ */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Hỗ trợ
            </h4>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              Cần trợ giúp trong quá trình học tập hoặc sử dụng hệ thống?
            </p>
            <div className="mt-3 rounded-lg border border-border bg-background p-3 text-xs space-y-1">
              <span className="block font-medium text-foreground">Email liên hệ:</span>
              <span className="text-primary font-mono">support@vibecoding.vn</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} VibeCoding. Tất cả các quyền được bảo lưu.</p>
          <p className="mt-2 flex items-center gap-1 sm:mt-0">
            Xây dựng với <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> bởi VibeCoding Team
          </p>
        </div>
      </div>
    </footer>
  )
}
