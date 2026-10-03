import { useMemo } from "react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/data-table"
import { createUserColumns, roleLabel } from "./columns"
import { useUsers } from "./use-users"
import { CreateUserDialog } from "./create-user-dialog"

export default function UsersPage() {
  const {
    users,
    total,
    pageCount,
    pagination,
    setPagination,
    sorting,
    setSorting,
    role,
    setRole,
    search,
    setSearch,
    loading,
    refetch,
    deleteUser,
  } = useUsers()
  const columns = useMemo(
    () => createUserColumns({ onDelete: deleteUser, onEditSuccess: refetch }),
    [deleteUser, refetch]
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Người dùng</h1>
        <CreateUserDialog onSuccess={refetch} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={users}
            loading={loading}
            pagination={pagination}
            onPaginationChange={setPagination}
            sorting={sorting}
            onSortingChange={setSorting}
            pageCount={pageCount}
            rowCount={total}
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Tìm theo tên hoặc email..."
            filters={() => (
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger size="sm" className="w-[160px]">
                  <SelectValue placeholder="Vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  {Object.entries(roleLabel).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            emptyMessage="Không có người dùng nào"
          />
        </CardContent>
      </Card>
    </div>
  )
}
