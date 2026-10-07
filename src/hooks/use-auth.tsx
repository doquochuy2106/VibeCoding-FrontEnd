import { createContext, useContext, useEffect, useState } from "react"
import { authService, type LoginResponse } from "@/services/auth.service"
import { cookieUtils } from "@/lib/cookie"
import { getMemoryToken, setMemoryToken, tryRefreshToken } from "@/lib/http-client"

interface AuthUser {
  username: string
}

interface AuthContextValue {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
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

  // accessToken chỉ lưu trong memory (React State + http-client memory)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Khôi phục phiên làm việc khi load trang (F5) dựa vào refresh token trong cookies
  useEffect(() => {
    // Dọn dẹp token trong localStorage nếu có từ trước
    localStorage.removeItem("access_token")
    localStorage.removeItem("accessToken")

    const initAuth = async () => {
      const hasRefreshToken = cookieUtils.get("refreshToken")
      if (hasRefreshToken) {
        const success = await tryRefreshToken()
        if (success) {
          const token = getMemoryToken()
          setAccessToken(token)
        } else {
          setUser(null)
          localStorage.removeItem("user")
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = (data: LoginResponse) => {
    const authUser = { username: data.username }
    localStorage.setItem("user", JSON.stringify(authUser))

    // Tuyệt đối không lưu access_token vào localStorage
    localStorage.removeItem("access_token")
    localStorage.removeItem("accessToken")

    // Lưu access_token vào Memory
    setAccessToken(data.access_token)
    setMemoryToken(data.access_token)
    setUser(authUser)

    // Lưu refresh_token vào Cookies
    if (data.refresh_token) {
      cookieUtils.set("refreshToken", data.refresh_token, 7)
    }
  }

  const logout = () => {
    const refreshToken = cookieUtils.get("refreshToken")
    // Gọi backend để huỷ token trong DB và xóa cookie
    authService.logout(refreshToken ?? undefined).catch(() => {})

    // Xóa cookie phía client
    cookieUtils.remove("refreshToken")

    // Xóa state và storage
    localStorage.removeItem("user")
    localStorage.removeItem("access_token")
    localStorage.removeItem("accessToken")
    setMemoryToken(null)
    setUser(null)
    setAccessToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user && !!accessToken,
        isLoading,
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
