import { apiClient } from "@/lib/http-client"
import type { PaginatedResponse } from "@/types/pagination"

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  imageUrl?: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    products: number
  }
}

export interface CreateCategoryPayload {
  name: string
  slug?: string
  description?: string
  imageUrl?: string | null
}

export interface UpdateCategoryPayload {
  name?: string
  slug?: string
  description?: string
  imageUrl?: string | null
}

export interface ListCategoriesParams
  extends Record<string, string | number | boolean | undefined> {
  page?: number
  limit?: number
  search?: string
  name?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export const categoriesService = {
  list: (params: ListCategoriesParams = {}, signal?: AbortSignal) =>
    apiClient.get<PaginatedResponse<Category>>("/categories", { params, signal }),
  getById: (id: number, signal?: AbortSignal) =>
    apiClient.get<Category>(`/categories/${id}`, { signal }),
  create: (payload: CreateCategoryPayload, signal?: AbortSignal) =>
    apiClient.post<Category>("/categories", payload, { signal }),
  update: (id: number, payload: UpdateCategoryPayload, signal?: AbortSignal) =>
    apiClient.patch<Category>(`/categories/${id}`, payload, { signal }),
  remove: (id: number, signal?: AbortSignal) =>
    apiClient.delete<void>(`/categories/${id}`, { signal }),
}
