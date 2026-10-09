import { useState, useRef } from "react"
import {
  PlusIcon,
  UploadCloudIcon,
  Loader2Icon,
  Trash2Icon,
  RefreshCwIcon,
  PackagePlusIcon,
  CheckCircle2Icon,
  EyeOffIcon,
  EyeIcon,
} from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import { ImageModal } from "@/components/ui/image-modal"
import { productsService } from "@/services/products.service"
import { uploadService } from "@/services/upload.service"
import { ApiError } from "@/lib/http-client"
import { getAssetUrl } from "@/lib/utils"

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
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductFormValues>({
    defaultValues: EMPTY_FORM,
  })

  const currentImageUrl = watch("imageUrl")
  const currentStatus = watch("isActive")

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      reset(EMPTY_FORM)
      setIsUploading(false)
      setIsDragging(false)
      setIsImageModalOpen(false)
    }
  }

  const handleFileChange = async (file: File) => {
    if (!file) return

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      toast.error("Vui lòng chọn file hình ảnh (JPG, PNG, WEBP, GIF)!")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dung lượng ảnh tối đa là 5MB!")
      return
    }

    try {
      setIsUploading(true)
      const res = await uploadService.uploadProductImage(file)
      setValue("imageUrl", res.url, { shouldValidate: true })
      toast.success("Tải ảnh sản phẩm lên thành công!")
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Tải ảnh thất bại, vui lòng thử lại."
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileChange(file)
    }
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const handleRemoveImage = () => {
    setValue("imageUrl", "")
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
          <Button className="gap-2 font-medium">
            <PlusIcon className="h-4 w-4" />
            Thêm sản phẩm
          </Button>
        }
      />
      <DialogContent className="sm:max-w-4xl w-[94vw] max-h-[90vh] overflow-y-auto p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Header */}
          <DialogHeader className="gap-1.5 pb-1">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <PackagePlusIcon className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  Thêm sản phẩm mới
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Điền thông tin và tải ảnh để đưa sản phẩm lên kệ bán hàng
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Separator />

          {/* Bố cục ngang 2 cột */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* CỘT TRÁI (md:col-span-5): Tải ảnh & Preview */}
            <div className="md:col-span-5 flex flex-col gap-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Ảnh sản phẩm
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tải lên ảnh sắc nét, khuyến nghị tỉ lệ vuông 1:1
                </p>
              </div>

              {/* Input file ẩn */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={onFileInputChange}
              />

              {/* Khung Upload / Preview */}
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center aspect-square w-full rounded-2xl border-2 transition-all overflow-hidden ${
                  isDragging
                    ? "border-primary bg-primary/10 scale-[0.99]"
                    : currentImageUrl
                    ? "border-border bg-card shadow-sm"
                    : "border-dashed border-border/80 hover:border-primary/60 bg-muted/20 hover:bg-muted/30 cursor-pointer"
                }`}
                onClick={() => {
                  if (!currentImageUrl && !isUploading) {
                    fileInputRef.current?.click()
                  }
                }}
              >
                {/* Trạng thái Uploading */}
                {isUploading && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/85 backdrop-blur-xs gap-3">
                    <Loader2Icon className="h-9 w-9 animate-spin text-primary" />
                    <span className="text-xs font-medium text-foreground">
                      Đang xử lý & lưu ảnh...
                    </span>
                  </div>
                )}

                {/* Khi đã có ảnh -> Hiển thị Preview */}
                {currentImageUrl ? (
                  <div
                    className="relative group w-full h-full flex items-center justify-center bg-black/5 dark:bg-black/30 p-2 cursor-pointer"
                    onClick={() => setIsImageModalOpen(true)}
                    title="Nhấn để xem ảnh phóng to"
                  >
                    <img
                      src={getAssetUrl(currentImageUrl)}
                      alt="Ảnh sản phẩm"
                      className="w-full h-full object-contain rounded-xl transition-transform duration-200 group-hover:scale-[1.02]"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />

                    {/* Badge gợi ý phóng to ở góc */}
                    <div className="absolute top-2.5 left-2.5 bg-black/65 text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <EyeIcon className="h-3 w-3" />
                      Xem ảnh
                    </div>

                    {/* Overlay Action buttons */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3 rounded-xl">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsImageModalOpen(true)
                        }}
                        className="h-8 gap-1.5 shadow-md text-xs font-medium"
                      >
                        <EyeIcon className="h-3.5 w-3.5" />
                        Xem ảnh
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          fileInputRef.current?.click()
                        }}
                        disabled={isUploading}
                        className="h-8 gap-1.5 shadow-md text-xs font-medium"
                      >
                        <RefreshCwIcon className="h-3.5 w-3.5" />
                        Đổi ảnh
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveImage()
                        }}
                        disabled={isUploading}
                        className="h-8 gap-1.5 shadow-md text-xs font-medium"
                      >
                        <Trash2Icon className="h-3.5 w-3.5" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Khi chưa có ảnh -> Dropzone */
                  <div className="flex flex-col items-center justify-center p-6 text-center select-none">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <UploadCloudIcon className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      Nhấn để tải ảnh lên
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      hoặc kéo và thả file vào đây
                    </p>
                    <span className="inline-block mt-3 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
                      JPG, PNG, WEBP, GIF (Tối đa 5MB)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CỘT PHẢI (md:col-span-7): Form Thông tin chi tiết */}
            <div className="md:col-span-7 flex flex-col gap-4">
              {/* Tên sản phẩm */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="create-product-name"
                  className="text-sm font-medium text-foreground"
                >
                  Tên sản phẩm <span className="text-destructive">*</span>
                </label>
                <Input
                  id="create-product-name"
                  aria-invalid={!!errors.name}
                  placeholder="Ví dụ: Áo thun Cotton Compact Premium"
                  className="h-10"
                  {...register("name", {
                    required: "Vui lòng nhập tên sản phẩm",
                    minLength: {
                      value: 2,
                      message: "Tên sản phẩm phải có ít nhất 2 ký tự",
                    },
                  })}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Slug */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="create-product-slug"
                  className="text-sm font-medium text-foreground"
                >
                  Đường dẫn thân thiện (Slug)
                </label>
                <Input
                  id="create-product-slug"
                  placeholder="Tự động tạo theo tên sản phẩm nếu để trống"
                  className="h-9 font-mono text-xs text-muted-foreground"
                  {...register("slug")}
                />
              </div>

              {/* Giá và Tồn kho */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="create-product-price"
                    className="text-sm font-medium text-foreground"
                  >
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
                        className="h-10"
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
                    <p className="text-xs text-destructive">{errors.price.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="create-product-quantity"
                    className="text-sm font-medium text-foreground"
                  >
                    Số lượng tồn kho <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="create-product-quantity"
                    type="number"
                    min="0"
                    aria-invalid={!!errors.quantity}
                    placeholder="100"
                    className="h-10"
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
                    <p className="text-xs text-destructive">
                      {errors.quantity.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Trạng thái kinh doanh - Nút bấm trực quan */}
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">
                  Trạng thái kinh doanh
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setValue("isActive", "true")}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      currentStatus === "true"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-medium ring-1 ring-emerald-500"
                        : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <CheckCircle2Icon
                      className={`h-4 w-4 shrink-0 ${
                        currentStatus === "true"
                          ? "text-emerald-500"
                          : "text-muted-foreground"
                      }`}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold">Đang kinh doanh</span>
                      <span className="text-[11px] opacity-80">Hiển thị bán</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValue("isActive", "false")}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      currentStatus === "false"
                        ? "border-amber-500 bg-amber-500/10 text-amber-400 font-medium ring-1 ring-amber-500"
                        : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <EyeOffIcon
                      className={`h-4 w-4 shrink-0 ${
                        currentStatus === "false"
                          ? "text-amber-500"
                          : "text-muted-foreground"
                      }`}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold">Tạm ẩn</span>
                      <span className="text-[11px] opacity-80">Ngừng kinh doanh</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Mô tả chi tiết */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="create-product-desc"
                  className="text-sm font-medium text-foreground"
                >
                  Mô tả chi tiết sản phẩm
                </label>
                <textarea
                  id="create-product-desc"
                  rows={4}
                  className="w-full rounded-xl border border-input bg-muted/10 px-3.5 py-2.5 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Nhập thông tin chi tiết về chất liệu, thông số kích thước, hướng dẫn bảo quản..."
                  {...register("description")}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Footer */}
          <DialogFooter className="gap-2 sm:justify-end">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting || isUploading}
                  className="px-5"
                >
                  Hủy
                </Button>
              }
            />
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-6 font-medium gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo sản phẩm"
              )}
            </Button>
          </DialogFooter>
        </form>

        {currentImageUrl && (
          <ImageModal
            open={isImageModalOpen}
            onClose={() => setIsImageModalOpen(false)}
            src={currentImageUrl}
            title={watch("name") ? `Ảnh sản phẩm: ${watch("name")}` : "Xem ảnh sản phẩm"}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
