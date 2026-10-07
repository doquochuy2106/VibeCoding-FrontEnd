export const cookieUtils = {
  get(name: string): string | null {
    if (typeof document === "undefined") return null
    const match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"))
    return match ? decodeURIComponent(match[2]) : null
  },

  set(name: string, value: string, days = 7) {
    if (typeof document === "undefined") return
    const expires = new Date(Date.now() + days * 864e5).toUTCString()
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
  },

  remove(name: string) {
    if (typeof document === "undefined") return
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`
  },
}
