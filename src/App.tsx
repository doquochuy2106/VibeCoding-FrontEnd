import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { toast } from "react-toastify"
import ClientLayout from "./client/layout/client-layout"
import HomePage from "./client/pages/home"
import LoginPage from "./client/pages/login"
import RegisterPage from "./client/pages/register"
import AdminLayout from "./admin/layout/admin-layout"
import DashboardPage from "./admin/pages/dashboard"
import UsersPage from "./admin/pages/users"
import ProductsPage from "./admin/pages/products"
import SettingsPage from "./admin/pages/settings"
import { ThemeProvider } from "./hooks/use-theme"
import { AuthProvider, useAuth } from "./hooks/use-auth"
import "./global.css"

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    toast.error("Vui lòng đăng nhập để truy cập trang quản trị!", {
      toastId: "admin-unauthenticated",
    })
    return <Navigate to="/login" replace />
  }

  if (user?.role?.toUpperCase() !== "ADMIN") {
    toast.error("Bạn không có quyền truy cập trang quản trị!", {
      toastId: "admin-forbidden",
    })
    return <Navigate to="/home" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Client Routes (Client Layout with Header & Theme Toggle) */}
            <Route element={<ClientLayout />}>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Admin Routes - Protected for ADMIN role only */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
