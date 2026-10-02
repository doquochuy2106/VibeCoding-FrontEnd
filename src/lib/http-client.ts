const BASE_URL = import.meta.env.VITE_BACKEND_URL

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

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, body, headers, ...rest } = options

  const res = await fetch(buildUrl(path, params), {
    ...rest,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    throw new ApiError(res.status, await extractErrorMessage(res, options.method ?? "GET", path))
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

// Thin wrapper around fetch shared by every resource's service file.
// Resource services (e.g. users.service.ts) call these instead of `fetch` directly.
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
