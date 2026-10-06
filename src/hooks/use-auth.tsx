import { createContext, useContext, useState } from "react"
import type { LoginResponse } from "@/services/auth.service"

interface AuthUser {
  username: string
}

interface AuthContextValue {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  login: (data: LoginResponse) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null
    try {
      const stored = localStorage.getItem("user")
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("access_token")
  })

  const login = (data: LoginResponse) => {
    const authUser = { username: data.username }
    localStorage.setItem("user", JSON.stringify(authUser))
    localStorage.setItem("access_token", data.access_token)
    localStorage.setItem("accessToken", data.access_token)
    setUser(authUser)
    setAccessToken(data.access_token)
  }

  const logout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("access_token")
    localStorage.removeItem("accessToken")
    setUser(null)
    setAccessToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user && !!accessToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
