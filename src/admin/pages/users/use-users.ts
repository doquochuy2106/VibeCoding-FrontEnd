import { useCallback, useEffect, useState } from "react"
import type { OnChangeFn, PaginationState, SortingState } from "@tanstack/react-table"
import { toast } from "react-toastify"

import { useFetch } from "@/hooks/use-fetch"
import { usersService } from "@/services/users.service"
import { ApiError } from "@/lib/http-client"

const DEFAULT_PAGE_SIZE = 10

export function useUsers() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [role, setRole] = useState<string>("all")
  const [search, setSearch] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")
  const [reloadKey, setReloadKey] = useState(0)

  // Debounce tìm kiếm (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }, 350)
    return () => clearTimeout(handler)
  }, [search])

  const sortBy = sorting[0]?.id
  const sortOrder =
    sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : undefined

  const { data, loading } = useFetch(
    (signal) =>
      usersService.list(
        {
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          search: debouncedSearch.trim() || undefined,
          role: role !== "all" ? role : undefined,
          sortBy,
          sortOrder,
        },
        signal
      ),
    [
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearch,
      role,
      sortBy,
      sortOrder,
      reloadKey,
    ]
  )

  const refetch = useCallback(() => setReloadKey((key) => key + 1), [])

  const handleRoleChange = useCallback((newRole: string | null) => {
    setRole(newRole ?? "all")
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [])

  const handleSortingChange: OnChangeFn<SortingState> = useCallback(
    (updaterOrValue) => {
      setSorting((prev) =>
        typeof updaterOrValue === "function"
          ? updaterOrValue(prev)
          : updaterOrValue
      )
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    },
    []
  )

  const deleteUser = useCallback(
    async (id: number) => {
      try {
        await usersService.remove(id)
        toast.success("Xóa người dùng thành công.")
        refetch()
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Đã có lỗi xảy ra, vui lòng thử lại."
        toast.error(message)
      }
    },
    [refetch]
  )

  return {
    users: data?.data ?? [],
    total: data?.meta.total ?? 0,
    pageCount: data?.meta.totalPages ?? 0,
    pagination,
    setPagination,
    sorting,
    setSorting: handleSortingChange,
    role,
    setRole: handleRoleChange,
    search,
    setSearch,
    loading,
    refetch,
    deleteUser,
  }
}
