import { apiClient } from "@/lib/http-client"
import type { PaginatedResponse } from "@/types/pagination"
import type { User } from "@/admin/pages/users/columns"

export interface CreateUserPayload {
  email: string
  password: string
  name: string
  phone: string
}

export interface UpdateUserPayload {
  name: string
  phone: string
}

export const usersService = {
  list: (params: { page: number; limit: number }, signal?: AbortSignal) =>
    apiClient.get<PaginatedResponse<User>>("/users", { params, signal }),
  create: (payload: CreateUserPayload, signal?: AbortSignal) =>
    apiClient.post<User>("/users", payload, { signal }),
  update: (id: number, payload: UpdateUserPayload, signal?: AbortSignal) =>
    apiClient.patch<User>(`/users/${id}`, payload, { signal }),
  remove: (id: number, signal?: AbortSignal) =>
    apiClient.delete<void>(`/users/${id}`, { signal }),
}
