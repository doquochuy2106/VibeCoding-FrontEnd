import { toast } from "react-toastify"
import { cookieUtils } from "./cookie"
import type { RefreshTokenResponse } from "@/services/auth.service"

const BASE_URL = import.meta.env.VITE_BACKEND_URL

// Biến lưu trữ access_token trong memory (RAM), KHÔNG lưu ở localStorage
let memoryAccessToken: string | null = null

export const setMemoryToken = (token: string | null) => {
  memoryAccessToken = token
}

export const getMemoryToken = () => {
  return memoryAccessToken
}

// Handler thông báo cho AuthProvider khi phiên làm việc hết hạn
type AuthExpiredHandler = () => void
let authExpiredHandler: AuthExpiredHandler | null = null

export const setOnAuthExpired = (handler: AuthExpiredHandler | null) => {
  authExpiredHandler = handler
}

let isHandlingAuthExpired = false

export const triggerAuthExpired = () => {
  setMemoryToken(null)
  cookieUtils.remove("refreshToken")
  localStorage.removeItem("user")
  localStorage.removeItem("access_token")
  localStorage.removeItem("accessToken")

  if (isHandlingAuthExpired) return
  isHandlingAuthExpired = true

  toast.error("Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại!", {
    toastId: "session-expired",
  })

  if (authExpiredHandler) {
    authExpiredHandler()
  } else if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    setTimeout(() => {
      window.location.replace("/login")
    }, 200)
  }

  setTimeout(() => {
    isHandlingAuthExpired = false
  }, 1000)
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

type QueryParams = Record<string, string | number | boolean | undefined>

interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: QueryParams
  body?: unknown
  _retry?: boolean
}

function buildUrl(path: string, params?: QueryParams) {
  const url = new URL(path, BASE_URL)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

async function extractErrorMessage(res: Response, method: string, path: string): Promise<string> {
  try {
    const body = await res.clone().json()
    if (Array.isArray(body?.message)) return body.message.join(", ")
    if (typeof body?.message === "string") return body.message
  } catch {
    // response body wasn't JSON, fall through to the default message
  }
  return `${method} ${path} failed with ${res.status}`
}

// Xử lý gọi refresh token (tránh gọi trùng lặp nhiều lần nếu nhiều request đồng thời)
let refreshPromise: Promise<RefreshTokenResponse | null> | null = null

export async function tryRefreshToken(): Promise<RefreshTokenResponse | null> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const refreshToken = cookieUtils.get("refreshToken")
      const res = await fetch(buildUrl("/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(refreshToken ? { refreshToken } : {}),
      })

      if (!res.ok) {
        if (res.status === 401) {
          triggerAuthExpired()
        } else {
          setMemoryToken(null)
          cookieUtils.remove("refreshToken")
        }
        return null
      }

      const data: RefreshTokenResponse = await res.json()
      if (data.access_token) {
        setMemoryToken(data.access_token)
        if (data.refresh_token) {
          cookieUtils.set("refreshToken", data.refresh_token, 7)
        }
        return data
      }

      triggerAuthExpired()
      return null
    } catch {
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, body, headers, _retry, ...rest } = options

  // Lấy access_token trực tiếp từ memory
  const token = memoryAccessToken
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData

  const res = await fetch(buildUrl(path, params), {
    ...rest,
    credentials: "include", // Luôn gửi kèm cookie
    headers: {
      ...(!isFormData && body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
  })

  // Nếu bị 401 Unauthorized và chưa retry, tự động thử refresh token
  if (
    res.status === 401 &&
    !_retry &&
    path !== "/auth/refresh" &&
    path !== "/auth/login"
  ) {
    const refreshed = await tryRefreshToken()
    if (refreshed) {
      return request<T>(path, { ...options, _retry: true })
    }
  }

  if (!res.ok) {
    if (res.status === 401 && path !== "/auth/login") {
      triggerAuthExpired()
    }
    throw new ApiError(res.status, await extractErrorMessage(res, options.method ?? "GET", path))
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

// Thin wrapper around fetch shared by every resource's service file.
export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
}
