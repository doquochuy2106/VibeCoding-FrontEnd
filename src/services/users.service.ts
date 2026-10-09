import { apiClient } from "@/lib/http-client"
import type { PaginatedResponse } from "@/types/pagination"
import type { User } from "@/admin/pages/users/columns"

export interface CreateUserPayload {
  email: string
  password: string
  name: string
  phone: string
  avatar?: string
  role?: "ADMIN" | "CUSTOMER"
}

export interface UpdateUserPayload {
  name: string
  phone: string
  avatar?: string
  role?: "ADMIN" | "CUSTOMER"
}

export interface ListUsersParams
  extends Record<string, string | number | boolean | undefined> {
  page?: number
  limit?: number
  search?: string
  role?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export const usersService = {
  list: (params: ListUsersParams, signal?: AbortSignal) =>
    apiClient.get<PaginatedResponse<User>>("/users", { params, signal }),
  create: (payload: CreateUserPayload, signal?: AbortSignal) =>
    apiClient.post<User>("/users", payload, { signal }),
  update: (id: number, payload: UpdateUserPayload, signal?: AbortSignal) =>
    apiClient.patch<User>(`/users/${id}`, payload, { signal }),
  remove: (id: number, signal?: AbortSignal) =>
    apiClient.delete<void>(`/users/${id}`, { signal }),
}
