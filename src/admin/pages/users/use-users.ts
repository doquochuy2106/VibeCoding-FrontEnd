import { useCallback, useState } from "react"
import type { PaginationState } from "@tanstack/react-table"
import { toast } from "react-toastify"

import { useFetch } from "@/hooks/use-fetch"
import { usersService } from "@/services/users.service"
import { ApiError } from "@/lib/http-client"

const DEFAULT_PAGE_SIZE = 10;

export function useUsers() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })
  const [reloadKey, setReloadKey] = useState(0)

  const { data, loading } = useFetch(
    (signal) =>
      usersService.list(
        { page: pagination.pageIndex + 1, limit: pagination.pageSize },
        signal
      ),
    [pagination.pageIndex, pagination.pageSize, reloadKey]
  )

  const refetch = useCallback(() => setReloadKey((key) => key + 1), [])

  const deleteUser = useCallback(async (id: number) => {
    try {
      await usersService.remove(id)
      toast.success("Xóa người dùng thành công.")
      refetch()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Đã có lỗi xảy ra, vui lòng thử lại."
      toast.error(message)
    }
  }, [refetch])

  return {
    users: data?.data ?? [],
    total: data?.meta.total ?? 0,
    pageCount: data?.meta.totalPages ?? 0,
    pagination,
    setPagination,
    loading,
    refetch,
    deleteUser,
  }
}
