import { apiClient } from "@/lib/http-client"
import type { PaginatedResponse } from "@/types/pagination"
import type { Category } from "./categories.service"

export interface Product {
  id: number
  name: string
  slug: string
  description: string | null
  price: number | string
  imageUrl: string | null
  quantity: number
  isActive: boolean
  categoryId: number | null
  category?: Category | null
  createdAt: string
  updatedAt: string
}

export interface CreateProductPayload {
  name: string
  slug?: string
  description?: string
  price: number
  imageUrl?: string
  quantity?: number
  isActive?: boolean
  categoryId: number
}

export interface UpdateProductPayload {
  name?: string
  slug?: string
  description?: string
  price?: number
  imageUrl?: string
  quantity?: number
  isActive?: boolean
  categoryId?: number
}

export interface ListProductsParams
  extends Record<string, string | number | boolean | undefined> {
  page?: number
  limit?: number
  search?: string
  isActive?: string
  categoryId?: number
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export const productsService = {
  list: (params: ListProductsParams, signal?: AbortSignal) =>
    apiClient.get<PaginatedResponse<Product>>("/products", { params, signal }),
  getById: (id: number, signal?: AbortSignal) =>
    apiClient.get<Product>(`/products/${id}`, { signal }),
  create: (payload: CreateProductPayload, signal?: AbortSignal) =>
    apiClient.post<Product>("/products", payload, { signal }),
  update: (id: number, payload: UpdateProductPayload, signal?: AbortSignal) =>
    apiClient.patch<Product>(`/products/${id}`, payload, { signal }),
  remove: (id: number, signal?: AbortSignal) =>
    apiClient.delete<void>(`/products/${id}`, { signal }),
}
