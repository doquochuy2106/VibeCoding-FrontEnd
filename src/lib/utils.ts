import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Tạo URL đầy đủ cho ảnh tĩnh từ backend
 */
export function getAssetUrl(path?: string | null): string {
  if (!path) return ""
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path
  }
  const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  return `${cleanBase}${cleanPath}`
}
