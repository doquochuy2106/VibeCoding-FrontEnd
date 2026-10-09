import { useState } from "react"
import { createColumnHelper } from "@tanstack/react-table"
import { Trash2Icon, PackageIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PopConfirm } from "@/components/ui/pop-confirm"
import {
  DataTableColumnHeader,
  type DataTableFeatures,
} from "@/components/data-table"
import { ImageModal } from "@/components/ui/image-modal"
import { EditProductDialog } from "./edit-product-dialog"
import type { Product } from "@/services/products.service"
import { getAssetUrl } from "@/lib/utils"

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "number" ? amount : Number(amount) || 0
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num)
}

function ProductImageCell({ product }: { product: Product }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted ${
          product.imageUrl ? "cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all" : ""
        }`}
        onClick={(e) => {
          if (product.imageUrl) {
            e.stopPropagation()
            setOpen(true)
          }
        }}
        title={product.imageUrl ? "Nhấn để phóng to ảnh" : undefined}
      >
        {product.imageUrl ? (
          <img
            src={getAssetUrl(product.imageUrl)}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = "none"
              e.currentTarget.parentElement?.classList.add(
                "flex",
                "items-center",
                "justify-center"
              )
            }}
          />
        ) : (
          <PackageIcon className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {product.imageUrl && (
        <ImageModal
          open={open}
          onClose={() => setOpen(false)}
          src={product.imageUrl}
          title={`Sản phẩm: ${product.name}`}
        />
      )}
    </>
  )
}

const columnHelper = createColumnHelper<DataTableFeatures, Product>()

function DeleteProductButton({
  product,
  onDelete,
}: {
  product: Product
  onDelete: (id: number) => Promise<void>
}) {
  return (
    <PopConfirm
      title="Xóa sản phẩm?"
      description={`Bạn có chắc muốn xóa "${product.name}"? Hành động này không thể hoàn tác.`}
      confirmText="Xóa"
      onConfirm={() => onDelete(product.id)}
    >
      <Button variant="ghost" size="icon" aria-label="Xóa sản phẩm">
        <Trash2Icon className="text-destructive" />
      </Button>
    </PopConfirm>
  )
}

interface ProductColumnActions {
  onDelete: (id: number) => Promise<void>
  onEditSuccess: () => void
}

export function createProductColumns({
  onDelete,
  onEditSuccess,
}: ProductColumnActions) {
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
        <DataTableColumnHeader column={column} title="Sản phẩm" />
      ),
      sortFn: "text",
      meta: { label: "Sản phẩm" },
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex items-center gap-3">
            <ProductImageCell product={product} />
            <div className="flex flex-col min-w-0 max-w-[240px]">
              <span className="truncate font-medium text-foreground" title={product.name}>
                {product.name}
              </span>
              <span className="truncate text-xs text-muted-foreground" title={product.slug}>
                /{product.slug}
              </span>
            </div>
          </div>
        )
      },
    }),
    columnHelper.accessor("price", {
      id: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Đơn giá" />
      ),
      sortFn: "alphanumeric",
      meta: { label: "Đơn giá" },
      cell: ({ getValue }) => (
        <span className="font-semibold tabular-nums text-foreground">
          {formatCurrency(getValue())}
        </span>
      ),
    }),
    columnHelper.accessor("quantity", {
      id: "quantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tồn kho" />
      ),
      sortFn: "alphanumeric",
      meta: { label: "Tồn kho" },
      cell: ({ getValue }) => {
        const qty = getValue()
        if (qty <= 0) {
          return (
            <Badge variant="destructive" className="text-xs">
              Hết hàng
            </Badge>
          )
        }
        if (qty <= 10) {
          return (
            <span className="font-medium text-amber-500 tabular-nums">
              {qty} (Sắp hết)
            </span>
          )
        }
        return <span className="tabular-nums font-medium">{qty}</span>
      },
    }),
    columnHelper.accessor("isActive", {
      id: "isActive",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Trạng thái" />
      ),
      sortFn: "alphanumeric",
      filterFn: "equalsString",
      meta: { label: "Trạng thái" },
      cell: ({ getValue }) => {
        const active = getValue()
        return (
          <Badge variant={active ? "default" : "secondary"}>
            {active ? "Đang bán" : "Tạm ẩn"}
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
          <EditProductDialog product={row.original} onSuccess={onEditSuccess} />
          <DeleteProductButton product={row.original} onDelete={onDelete} />
        </div>
      ),
    }),
  ])
}
