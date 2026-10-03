import { BrowserRouter, Routes, Route } from "react-router-dom"
import Footer from "./components/footer"
import Header from "./components/header"
import AdminLayout from "./admin/layout/admin-layout"
import DashboardPage from "./admin/pages/dashboard"
import UsersPage from "./admin/pages/users"
import ProductsPage from "./admin/pages/products"
import SettingsPage from "./admin/pages/settings"
import { ThemeProvider } from "./hooks/use-theme"
import './global.css';

function ClientLayout() {
  return (
    <div className="hoidanit">
      <h1 className="text-3xl font-bold underline">
        Hello world! with tailwind
      </h1>
      <Header />
      <Footer />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ClientLayout />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
