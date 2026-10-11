import { apiClient } from "@/lib/http-client"
import type { PaginatedResponse } from "@/types/pagination"
import type { Product } from "./products.service"

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED"

export interface OrderUser {
  id: number
  email: string
  name: string | null
  phone: string | null
  avatar: string | null
  role: string
}

export interface OrderItem {
  id: number
  orderId: number
  productId: number
  quantity: number
  price: number
  createdAt: string
  product?: Product | null
}

export interface Order {
  id: number
  userId: number | null
  user?: OrderUser | null
  customerName: string
  customerPhone: string
  shippingAddress: string
  totalAmount: number
  status: OrderStatus
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateOrderItemPayload {
  productId: number
  quantity: number
  price?: number
}

export interface CreateOrderPayload {
  userId?: number
  customerName: string
  customerPhone: string
  shippingAddress: string
  totalAmount?: number
  status?: OrderStatus
  items: CreateOrderItemPayload[]
}

export interface UpdateOrderPayload {
  customerName?: string
  customerPhone?: string
  shippingAddress?: string
  totalAmount?: number
  status?: OrderStatus
  items?: CreateOrderItemPayload[]
}

export interface ListOrdersParams
  extends Record<string, string | number | boolean | undefined> {
  page?: number
  limit?: number
  search?: string
  status?: string
  userId?: number
  minTotal?: number
  maxTotal?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string
    badgeVariant: "default" | "secondary" | "destructive" | "outline"
    className: string
  }
> = {
  PENDING: {
    label: "Chờ xác nhận",
    badgeVariant: "outline",
    className:
      "border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    badgeVariant: "outline",
    className:
      "border-blue-500/40 bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  SHIPPED: {
    label: "Đang giao hàng",
    badgeVariant: "outline",
    className:
      "border-purple-500/40 bg-purple-500/15 text-purple-600 dark:text-purple-400",
  },
  COMPLETED: {
    label: "Hoàn thành",
    badgeVariant: "outline",
    className:
      "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  CANCELLED: {
    label: "Đã hủy",
    badgeVariant: "destructive",
    className:
      "border-destructive/40 bg-destructive/15 text-destructive",
  },
}

export const ordersService = {
  list: (params: ListOrdersParams, signal?: AbortSignal) =>
    apiClient.get<PaginatedResponse<Order>>("/orders", { params, signal }),
  myOrders: (params: ListOrdersParams, signal?: AbortSignal) =>
    apiClient.get<PaginatedResponse<Order>>("/orders/my-orders", {
      params,
      signal,
    }),
  getById: (id: number, signal?: AbortSignal) =>
    apiClient.get<Order>(`/orders/${id}`, { signal }),
  create: (payload: CreateOrderPayload, signal?: AbortSignal) =>
    apiClient.post<Order>("/orders", payload, { signal }),
  update: (id: number, payload: UpdateOrderPayload, signal?: AbortSignal) =>
    apiClient.patch<Order>(`/orders/${id}`, payload, { signal }),
  updateStatus: (id: number, status: OrderStatus, signal?: AbortSignal) =>
    apiClient.patch<Order>(
      `/orders/${id}/status`,
      { status },
      { signal }
    ),
  remove: (id: number, signal?: AbortSignal) =>
    apiClient.delete<{ message: string; id: number }>(`/orders/${id}`, {
      signal,
    }),
}
