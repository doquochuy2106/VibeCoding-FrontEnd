import { apiClient } from "@/lib/http-client"

export interface UploadResponse {
  url: string
  filename: string
  originalName: string
  size: number
  mimetype: string
}

export const uploadService = {
  /**
   * Upload ảnh sản phẩm lên /upload/product
   */
  uploadProductImage: async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return apiClient.post<UploadResponse>("/upload/product", formData)
  },

  /**
   * Upload avatar người dùng lên /upload/user
   */
  uploadUserAvatar: async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return apiClient.post<UploadResponse>("/upload/user", formData)
  },

  /**
   * Upload ảnh chung
   */
  uploadGeneralImage: async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return apiClient.post<UploadResponse>("/upload/image", formData)
  },
}
