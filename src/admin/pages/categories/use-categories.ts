import { useCallback, useEffect, useState } from "react"
import type { OnChangeFn, PaginationState, SortingState } from "@tanstack/react-table"
import { toast } from "react-toastify"

import { useFetch } from "@/hooks/use-fetch"
import { categoriesService } from "@/services/categories.service"
import { ApiError } from "@/lib/http-client"

const DEFAULT_PAGE_SIZE = 10

export function useCategories() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [search, setSearch] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")
  const [reloadKey, setReloadKey] = useState(0)

  // Debounce search input (350ms)
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
      categoriesService.list(
        {
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          search: debouncedSearch.trim() || undefined,
          sortBy,
          sortOrder,
        },
        signal
      ),
    [
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearch,
      sortBy,
      sortOrder,
      reloadKey,
    ]
  )

  const refetch = useCallback(() => setReloadKey((key) => key + 1), [])

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

  const deleteCategory = useCallback(
    async (id: number) => {
      try {
        await categoriesService.remove(id)
        toast.success("Xóa danh mục thành công.")
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
    categories: data?.data ?? [],
    total: data?.meta.total ?? 0,
    pageCount: data?.meta.totalPages ?? 0,
    pagination,
    setPagination,
    sorting,
    setSorting: handleSortingChange,
    search,
    setSearch,
    loading,
    refetch,
    deleteCategory,
  }
}
