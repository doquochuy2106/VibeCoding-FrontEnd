import { Link } from "react-router-dom"
import { Heart, Mail, Globe, Phone, MapPin } from "lucide-react"
import gengLogo from "@/assets/geng-logo.png"

export default function ClientFooter() {
  return (
    <footer className="border-t border-border bg-card/60 text-foreground transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Col 1: Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <Link to="/home" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-primary/40 bg-[#09090b]">
                <img
                  src={gengLogo}
                  alt="Gen.G Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-display text-base font-extrabold">
                GEN.G <span className="text-primary">Store</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Hệ thống thương mại điện tử thời trang, Esport Pro Kit & phụ kiện chính hãng. Trải nghiệm mua sắm hiện đại, giao hàng siêu tốc và đổi trả tận nơi.
            </p>
            <div className="flex items-center gap-3 pt-2 text-muted-foreground text-xs">
              <span className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                <Globe className="h-3.5 w-3.5" />
                <span>vibestore.vn</span>
              </span>
              <span className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                <Mail className="h-3.5 w-3.5" />
                <span>support@vibestore.vn</span>
              </span>
            </div>
          </div>

          {/* Col 2: Mua sắm */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Danh mục nổi bật
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <a
                  href="/home#categories"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Áo thun & Polo
                </a>
              </li>
              <li>
                <a
                  href="/home#categories"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Quần Jeans & Kaki
                </a>
              </li>
              <li>
                <a
                  href="/home#categories"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Giày Sneaker & Thể thao
                </a>
              </li>
              <li>
                <a
                  href="/home#categories"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Balo, Đồng hồ & Phụ kiện
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Tài khoản & Hệ thống */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tài khoản & Dịch vụ
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link
                  to="/login"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Đăng nhập tài khoản
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Đăng ký thành viên mới
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Khu vực Quản trị (Admin)
                </Link>
              </li>
              <li>
                <a
                  href="#products"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Chính sách đổi trả 30 ngày
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Hỗ trợ */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Chăm sóc khách hàng
            </h4>
            <div className="mt-3 space-y-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Hotline: 1900 6868 (8:00 - 22:00)</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>TP. Hồ Chí Minh, Việt Nam</span>
              </p>
            </div>
            <div className="mt-3 rounded-lg border border-border bg-background p-3 text-xs space-y-1">
              <span className="block font-medium text-foreground">
                Email hỗ trợ đơn hàng:
              </span>
              <span className="text-primary font-mono">
                cskh@vibestore.vn
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} VibeStore E-Commerce. Tất cả các quyền được bảo lưu.
          </p>
          <p className="mt-2 flex items-center gap-1 sm:mt-0">
            Xây dựng với{" "}
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> bởi
            VibeCoding Team
          </p>
        </div>
      </div>
    </footer>
  )
}
