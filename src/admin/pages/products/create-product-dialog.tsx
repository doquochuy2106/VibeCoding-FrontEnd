import { useState } from "react"
import { PlusIcon } from "lucide-react"
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
import { productsService } from "@/services/products.service"
import { ApiError } from "@/lib/http-client"

export function formatPriceInput(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === "") return ""
  const digits = String(val).replace(/\D/g, "").replace(/^0+(?=\d)/, "")
  if (!digits) return ""
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

type CreateProductFormValues = {
  name: string
  slug?: string
  price: number | string
  quantity: number
  imageUrl?: string
  description?: string
  isActive: "true" | "false"
}

const EMPTY_FORM: CreateProductFormValues = {
  name: "",
  slug: "",
  price: "",
  quantity: 0,
  imageUrl: "",
  description: "",
  isActive: "true",
}

export function CreateProductDialog({ onSuccess }: { onSuccess?: () => void } = {}) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductFormValues>({
    defaultValues: EMPTY_FORM,
  })

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) reset(EMPTY_FORM)
  }

  const onSubmit = async (data: CreateProductFormValues) => {
    try {
      const cleanPrice =
        typeof data.price === "number"
          ? data.price
          : Number(String(data.price).replace(/\D/g, "")) || 0

      await productsService.create({
        name: data.name.trim(),
        slug: data.slug?.trim() || undefined,
        price: cleanPrice,
        quantity: Number(data.quantity) || 0,
        imageUrl: data.imageUrl?.trim() || undefined,
        description: data.description?.trim() || undefined,
        isActive: data.isActive === "true",
      })
      toast.success("Tạo sản phẩm thành công.")
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
          <Button>
            <PlusIcon />
            Thêm sản phẩm
          </Button>
        }
      />
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Thêm sản phẩm mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin chi tiết để thêm sản phẩm vào danh mục bán hàng.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            {/* Tên sản phẩm */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="create-product-name" className="text-sm font-medium">
                Tên sản phẩm <span className="text-destructive">*</span>
              </label>
              <Input
                id="create-product-name"
                aria-invalid={!!errors.name}
                placeholder="Ví dụ: Áo thun Cotton Compact"
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
              <label htmlFor="create-product-slug" className="text-sm font-medium">
                Đường dẫn slug (Tùy chọn)
              </label>
              <Input
                id="create-product-slug"
                placeholder="Để trống hệ thống sẽ tự động tạo từ tên sản phẩm"
                {...register("slug")}
              />
            </div>

            {/* Giá & Tồn kho */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="create-product-price" className="text-sm font-medium">
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
                      id="create-product-price"
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
                <label htmlFor="create-product-quantity" className="text-sm font-medium">
                  Số lượng tồn kho <span className="text-destructive">*</span>
                </label>
                <Input
                  id="create-product-quantity"
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
              <label htmlFor="create-product-image" className="text-sm font-medium">
                Link ảnh sản phẩm
              </label>
              <Input
                id="create-product-image"
                type="url"
                placeholder="https://example.com/image.jpg"
                {...register("imageUrl")}
              />
            </div>

            {/* Trạng thái hiển thị */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="create-product-status" className="text-sm font-medium">
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
                    <SelectTrigger id="create-product-status" className="w-full">
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
              <label htmlFor="create-product-desc" className="text-sm font-medium">
                Mô tả chi tiết
              </label>
              <textarea
                id="create-product-desc"
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Thông tin chi tiết về chất liệu, thông số kỹ thuật, hướng dẫn sử dụng..."
                {...register("description")}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" disabled={isSubmitting} />}>
              Hủy
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang tạo..." : "Tạo sản phẩm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
