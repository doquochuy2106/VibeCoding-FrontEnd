import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { authService } from "@/services/auth.service"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "react-toastify"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth()

  // Form states
  const [account, setAccount] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Tự động điều hướng nếu đã đăng nhập từ trước
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const userRole = (user.role || "CUSTOMER").toUpperCase()
      if (userRole === "ADMIN") {
        navigate("/admin", { replace: true })
      } else {
        navigate("/home", { replace: true })
      }
    }
  }, [authLoading, isAuthenticated, user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")

    // Frontend Validations
    if (!account.trim()) {
      setErrorMessage("Vui lòng nhập email hoặc số điện thoại.")
      return
    }

    if (!password) {
      setErrorMessage("Vui lòng nhập mật khẩu.")
      return
    }

    setIsLoading(true)

    try {
      // Call backend API /auth/login
      const res = await authService.login({
        username: account.trim(),
        password: password,
      })

      // Update global auth state & localStorage
      login(res)
      setSuccessMessage(`Đăng nhập thành công! Xin chào ${res.username}`)
      toast.success(`Đăng nhập thành công! Chào mừng ${res.username}`)

      // Kiểm tra role: CUSTOMER thì ở trang homepage, ADMIN thì ở trang admin
      const userRole = (res.role || "CUSTOMER").toUpperCase()
      setTimeout(() => {
        if (userRole === "ADMIN") {
          navigate("/admin")
        } else {
          navigate("/home")
        }
      }, 500)
    } catch (err: any) {
      let msg = "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
      if (err?.status === 401 || err?.message === "Unauthorized") {
        msg = "Mật khẩu không chính xác hoặc tài khoản không tồn tại."
      } else if (err?.message) {
        msg = err.message
      }
      setErrorMessage(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  // Quick fill helper for demo
  const handleQuickFillCustomer = () => {
    setAccount("test_probe@example.com")
    setPassword("password123")
    setErrorMessage("")
  }

  const handleQuickFillAdmin = () => {
    setAccount("admin@gmail.com")
    setPassword("123456")
    setErrorMessage("")
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Subtle Background Glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
        <div className="h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="h-64 w-64 translate-x-32 translate-y-24 rounded-full bg-accent/30 blur-2xl" />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Header Greeting */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Chào mừng bạn trở lại</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Đăng nhập vào tài khoản
          </h1>
          <p className="text-sm text-muted-foreground">
            Nhập thông tin đăng nhập của bạn để tiếp tục học tập và làm việc
          </p>
        </div>

        {/* Card Form */}
        <Card className="border-border/80 bg-card/95 shadow-xl shadow-black/5 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Thông tin đăng nhập</CardTitle>
            <CardDescription>
              Hỗ trợ đăng nhập linh hoạt bằng Email hoặc Số điện thoại
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Feedback Alerts */}
            {errorMessage && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 p-3 text-xs font-medium text-primary animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input 1: Email hoặc số điện thoại */}
              <div className="space-y-1.5">
                <label
                  htmlFor="account"
                  className="text-xs font-medium text-foreground flex items-center justify-between"
                >
                  <span>Email hoặc Số điện thoại</span>
                  <span className="text-[11px] text-muted-foreground">Bắt buộc</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="account"
                    type="text"
                    value={account}
                    onChange={(e) => {
                      setAccount(e.target.value)
                      if (errorMessage) setErrorMessage("")
                    }}
                    placeholder="name@example.com hoặc 0912345678"
                    className="h-10 pl-9 pr-3 text-sm"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Input 2: Mật khẩu */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-medium text-foreground"
                  >
                    Mật khẩu
                  </label>
                  <a
                    href="#forgot-password"
                    onClick={(e) => {
                      e.preventDefault()
                      toast.info("Tính năng quên mật khẩu đang được phát triển!")
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errorMessage) setErrorMessage("")
                    }}
                    placeholder="••••••••"
                    className="h-10 pl-9 pr-10 text-sm"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me & Options */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                  />
                  <span className="text-xs text-muted-foreground select-none">
                    Ghi nhớ đăng nhập
                  </span>
                </label>

                {/* Quick Demo Fill buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleQuickFillCustomer}
                    className="text-xs text-muted-foreground underline decoration-dotted hover:text-primary transition-colors"
                    title="test_probe@example.com / password123"
                  >
                    Mẫu Customer
                  </button>
                  <span className="text-xs text-muted-foreground/60">•</span>
                  <button
                    type="button"
                    onClick={handleQuickFillAdmin}
                    className="text-xs text-muted-foreground underline decoration-dotted hover:text-primary transition-colors"
                    title="admin@gmail.com / 123456"
                  >
                    Mẫu Admin
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="h-10 w-full gap-2 font-medium shadow-md shadow-primary/20"
              >
                {isLoading ? (
                  <span>Đang kết nối backend...</span>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Đăng nhập</span>
                  </>
                )}
              </Button>
            </form>

            {/* Social Logins Divider */}
            <div className="relative my-6 text-center text-xs">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <span className="relative bg-card px-2 text-muted-foreground">
                Hoặc đăng nhập với
              </span>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2 text-xs"
                onClick={() => toast.info("Đăng nhập Google đang được tích hợp.")}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2 text-xs"
                onClick={() => toast.info("Đăng nhập GitHub đang được tích hợp.")}
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Link to Register */}
        <div className="text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            Đăng ký ngay
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
