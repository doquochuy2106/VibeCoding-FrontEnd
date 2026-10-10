import { useState } from "react"
import { createColumnHelper } from "@tanstack/react-table"
import { Trash2Icon, FolderIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PopConfirm } from "@/components/ui/pop-confirm"
import { ImageModal } from "@/components/ui/image-modal"
import {
  DataTableColumnHeader,
  type DataTableFeatures,
} from "@/components/data-table"
import { EditCategoryDialog } from "./edit-category-dialog"
import type { Category } from "@/services/categories.service"
import { getAssetUrl } from "@/lib/utils"

const columnHelper = createColumnHelper<DataTableFeatures, Category>()

function CategoryImageCell({ category }: { category: Category }) {
  const [open, setOpen] = useState(false)
  const [imgError, setImgError] = useState(false)
  const hasImage = Boolean(category.imageUrl) && !imgError

  return (
    <>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted ${
          hasImage
            ? "cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all"
            : "bg-primary/10 text-primary"
        }`}
        onClick={(e) => {
          if (hasImage && category.imageUrl) {
            e.stopPropagation()
            setOpen(true)
          }
        }}
        title={hasImage ? "Nhấn để phóng to ảnh danh mục" : undefined}
      >
        {hasImage && category.imageUrl ? (
          <img
            src={getAssetUrl(category.imageUrl)}
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <FolderIcon className="h-5 w-5 text-primary" />
        )}
      </div>

      {hasImage && category.imageUrl && (
        <ImageModal
          open={open}
          onClose={() => setOpen(false)}
          src={category.imageUrl}
          title={`Danh mục: ${category.name}`}
        />
      )}
    </>
  )
}

function CategoryNameCell({ category }: { category: Category }) {
  return (
    <div className="flex items-center gap-3">
      <CategoryImageCell category={category} />
      <div className="flex flex-col min-w-0 max-w-[240px]">
        <span
          className="truncate font-medium text-foreground"
          title={category.name}
        >
          {category.name}
        </span>
        <span
          className="truncate font-mono text-xs text-muted-foreground"
          title={category.slug}
        >
          /{category.slug}
        </span>
      </div>
    </div>
  )
}

function DeleteCategoryButton({
  category,
  onDelete,
}: {
  category: Category
  onDelete: (id: number) => Promise<void>
}) {
  return (
    <PopConfirm
      title="Xóa danh mục?"
      description={`Bạn có chắc muốn xóa danh mục "${category.name}"? Hành động này không thể hoàn tác.`}
      confirmText="Xóa"
      onConfirm={() => onDelete(category.id)}
    >
      <Button variant="ghost" size="icon" aria-label="Xóa danh mục">
        <Trash2Icon className="text-destructive" />
      </Button>
    </PopConfirm>
  )
}

interface CategoryColumnActions {
  onDelete: (id: number) => Promise<void>
  onEditSuccess: () => void
}

export function createCategoryColumns({
  onDelete,
  onEditSuccess,
}: CategoryColumnActions) {
  return columnHelper.columns([
    columnHelper.accessor("id", {
      id: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Id" />
      ),
      sortFn: "alphanumeric",
      meta: { label: "Id" },
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          #{row.original.id}
        </span>
      ),
    }),
    columnHelper.accessor("name", {
      id: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tên danh mục" />
      ),
      sortFn: "text",
      meta: { label: "Tên danh mục" },
      cell: ({ row }) => <CategoryNameCell category={row.original} />,
    }),
    columnHelper.accessor("slug", {
      id: "slug",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Slug" />
      ),
      sortFn: "text",
      meta: { label: "Slug" },
      cell: ({ getValue }) => (
        <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
          {getValue()}
        </code>
      ),
    }),
    columnHelper.accessor("description", {
      id: "description",
      header: "Mô tả",
      meta: { label: "Mô tả" },
      cell: ({ getValue }) => {
        const desc = getValue()
        return desc ? (
          <span
            className="line-clamp-2 max-w-[320px] text-sm text-muted-foreground"
            title={desc}
          >
            {desc}
          </span>
        ) : (
          <span className="text-xs italic text-muted-foreground/60">
            Chưa có mô tả
          </span>
        )
      },
    }),
    columnHelper.display({
      id: "productsCount",
      header: "Sản phẩm",
      meta: { label: "Sản phẩm" },
      cell: ({ row }) => {
        const count = row.original._count?.products ?? 0
        return (
          <Badge variant={count > 0 ? "default" : "secondary"}>
            {count} sản phẩm
          </Badge>
        )
      },
    }),
    columnHelper.accessor("createdAt", {
      id: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ngày tạo" />
      ),
      sortFn: "datetime",
      meta: { label: "Ngày tạo" },
      cell: ({ getValue }) =>
        new Date(getValue()).toLocaleDateString("vi-VN"),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      meta: { label: "Thao tác" },
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <EditCategoryDialog
            category={row.original}
            onSuccess={onEditSuccess}
          />
          <DeleteCategoryButton
            category={row.original}
            onDelete={onDelete}
          />
        </div>
      ),
    }),
  ])
}
