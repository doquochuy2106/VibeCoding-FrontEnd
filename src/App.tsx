import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
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
import { AuthProvider } from "./hooks/use-auth"
import "./global.css"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Client Routes (Client Layout with Header & Theme Toggle) */}
          <Route element={<ClientLayout />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
  )
}

export default App
