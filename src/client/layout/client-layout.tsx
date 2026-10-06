import { Outlet } from "react-router-dom"
import ClientHeader from "./client-header"
import ClientFooter from "./client-footer"

export default function ClientLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-200">
      <ClientHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <ClientFooter />
    </div>
  )
}
