import { useState } from "react"
import { PencilIcon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { productsService, type Product } from "@/services/products.service"
import { ApiError } from "@/lib/http-client"
import { formatPriceInput } from "./create-product-dialog"

type EditProductFormValues = {
  name: string
  slug: string
  price: number | string
  quantity: number
  imageUrl: string
  description: string
  isActive: "true" | "false"
}

export function EditProductDialog({
  product,
  onSuccess,
}: {
  product: Product
  onSuccess?: () => void
}) {
  const [open, setOpen] = useState(false)

  const defaultValues: EditProductFormValues = {
    name: product.name,
    slug: product.slug,
    price: Number(product.price) || 0,
    quantity: product.quantity,
    imageUrl: product.imageUrl ?? "",
    description: product.description ?? "",
    isActive: product.isActive ? "true" : "false",
  }

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EditProductFormValues>({ defaultValues })

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) {
      reset({
        name: product.name,
        slug: product.slug,
        price: Number(product.price) || 0,
        quantity: product.quantity,
        imageUrl: product.imageUrl ?? "",
        description: product.description ?? "",
        isActive: product.isActive ? "true" : "false",
      })
    }
  }

  const onSubmit = async (data: EditProductFormValues) => {
    try {
      const cleanPrice =
        typeof data.price === "number"
          ? data.price
          : Number(String(data.price).replace(/\D/g, "")) || 0

      await productsService.update(product.id, {
        name: data.name.trim(),
        slug: data.slug.trim() || undefined,
        price: cleanPrice,
        quantity: Number(data.quantity) || 0,
        imageUrl: data.imageUrl.trim() || undefined,
        description: data.description.trim() || undefined,
        isActive: data.isActive === "true",
      })
      toast.success("Cập nhật sản phẩm thành công.")
      handleOpenChange(false)
      onSuccess?.()
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Đã có lỗi xảy ra, vui lòng thử lại."
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Sửa sản phẩm" />
        }
      >
        <PencilIcon />
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Sửa thông tin sản phẩm</DialogTitle>
            <DialogDescription>
              Cập nhật giá, số lượng tồn kho hoặc thông tin sản phẩm #{product.id}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            {/* Tên sản phẩm */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-product-name" className="text-sm font-medium">
                Tên sản phẩm <span className="text-destructive">*</span>
              </label>
              <Input
                id="edit-product-name"
                aria-invalid={!!errors.name}
                placeholder="Tên sản phẩm"
                {...register("name", {
                  required: "Vui lòng nhập tên sản phẩm",
                  minLength: {
                    value: 2,
                    message: "Tên sản phẩm phải có ít nhất 2 ký tự",
                  },
                })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Slug */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-product-slug" className="text-sm font-medium">
                Đường dẫn slug <span className="text-destructive">*</span>
              </label>
              <Input
                id="edit-product-slug"
                aria-invalid={!!errors.slug}
                placeholder="duong-dan-san-pham"
                {...register("slug", {
                  required: "Vui lòng nhập slug",
                })}
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
            </div>

            {/* Giá & Tồn kho */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-product-price" className="text-sm font-medium">
                  Đơn giá (VNĐ) <span className="text-destructive">*</span>
                </label>
                <Controller
                  control={control}
                  name="price"
                  rules={{
                    required: "Vui lòng nhập đơn giá",
                    validate: (val) => {
                      if (val === "" || val === null || val === undefined) {
                        return "Vui lòng nhập đơn giá"
                      }
                      const num =
                        typeof val === "number"
                          ? val
                          : Number(String(val).replace(/\D/g, ""))
                      if (isNaN(num) || num < 0) {
                        return "Đơn giá không thể nhỏ hơn 0"
                      }
                      return true
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      id="edit-product-price"
                      type="text"
                      inputMode="numeric"
                      aria-invalid={!!errors.price}
                      placeholder="150.000"
                      value={formatPriceInput(field.value)}
                      onChange={(e) => {
                        const raw = e.target.value
                          .replace(/\D/g, "")
                          .replace(/^0+(?=\d)/, "")
                        field.onChange(raw === "" ? "" : Number(raw))
                      }}
                    />
                  )}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="edit-product-quantity" className="text-sm font-medium">
                  Số lượng tồn kho <span className="text-destructive">*</span>
                </label>
                <Input
                  id="edit-product-quantity"
                  type="number"
                  min="0"
                  aria-invalid={!!errors.quantity}
                  placeholder="100"
                  {...register("quantity", {
                    required: "Vui lòng nhập số lượng tồn kho",
                    min: {
                      value: 0,
                      message: "Số lượng không thể nhỏ hơn 0",
                    },
                    valueAsNumber: true,
                  })}
                />
                {errors.quantity && (
                  <p className="text-sm text-destructive">{errors.quantity.message}</p>
                )}
              </div>
            </div>

            {/* URL Hình ảnh */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-product-image" className="text-sm font-medium">
                Link ảnh sản phẩm
              </label>
              <Input
                id="edit-product-image"
                type="url"
                placeholder="https://example.com/image.jpg"
                {...register("imageUrl")}
              />
            </div>

            {/* Trạng thái hiển thị */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-product-status" className="text-sm font-medium">
                Trạng thái kinh doanh
              </label>
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      if (val) field.onChange(val)
                    }}
                  >
                    <SelectTrigger id="edit-product-status" className="w-full">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Đang kinh doanh (Hiển thị)</SelectItem>
                      <SelectItem value="false">Tạm ẩn (Ngừng bán)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Mô tả chi tiết */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-product-desc" className="text-sm font-medium">
                Mô tả chi tiết
              </label>
              <textarea
                id="edit-product-desc"
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Thông tin chi tiết về sản phẩm..."
                {...register("description")}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" disabled={isSubmitting} />}>
              Hủy
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
