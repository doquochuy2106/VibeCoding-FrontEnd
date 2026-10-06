import { apiClient } from "@/lib/http-client"

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  username: string
  access_token: string
}

export interface RegisterPayload {
  name: string
  email: string
  phone?: string
  password: string
}

export interface RegisterResponse {
  id: number
  email: string
  name: string
  phone?: string
  role: string
  createdAt: string
  updatedAt: string
}

export const authService = {
  login: (payload: LoginPayload, signal?: AbortSignal) =>
    apiClient.post<LoginResponse>("/auth/login", payload, { signal }),

  register: (payload: RegisterPayload, signal?: AbortSignal) =>
    apiClient.post<RegisterResponse>("/auth/register", payload, { signal }),
}
