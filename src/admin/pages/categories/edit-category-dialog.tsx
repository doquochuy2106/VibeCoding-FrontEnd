import { useState, useRef } from "react"
import {
  PencilIcon,
  FolderPenIcon,
  Loader2Icon,
  UploadCloudIcon,
  EyeIcon,
  RefreshCwIcon,
  Trash2Icon,
} from "lucide-react"
import { useForm } from "react-hook-form"
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
import { categoriesService, type Category } from "@/services/categories.service"
import { uploadService } from "@/services/upload.service"
import { ApiError } from "@/lib/http-client"
import { getAssetUrl } from "@/lib/utils"

type EditCategoryFormValues = {
  name: string
  slug: string
  description: string
  imageUrl: string
}

export function EditCategoryDialog({
  category,
  onSuccess,
}: {
  category: Category
  onSuccess?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const defaultValues: EditCategoryFormValues = {
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    imageUrl: category.imageUrl ?? "",
  }

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditCategoryFormValues>({ defaultValues })

  const currentImageUrl = watch("imageUrl")

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) {
      reset({
        name: category.name,
        slug: category.slug,
        description: category.description ?? "",
        imageUrl: category.imageUrl ?? "",
      })
    } else {
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
      const res = await uploadService.uploadCategoryImage(file)
      setValue("imageUrl", res.url, { shouldValidate: true })
      toast.success("Tải ảnh danh mục lên thành công!")
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Tải ảnh thất bại, vui lòng thử lại."
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

  const onSubmit = async (data: EditCategoryFormValues) => {
    try {
      await categoriesService.update(category.id, {
        name: data.name.trim(),
        slug: data.slug.trim() || undefined,
        description: data.description.trim() || undefined,
        imageUrl: data.imageUrl.trim() || null,
      })
      toast.success("Cập nhật danh mục thành công.")
      handleOpenChange(false)
      onSuccess?.()
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Đã có lỗi xảy ra, vui lòng thử lại."
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Sửa danh mục" />
        }
      >
        <PencilIcon />
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl w-[94vw] max-h-[90vh] overflow-y-auto p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <DialogHeader className="gap-1.5 pb-1">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <FolderPenIcon className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  Sửa danh mục #{category.id}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Cập nhật thông tin tên, đường dẫn slug, mô tả và ảnh đại diện danh mục
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* CỘT TRÁI (md:col-span-5): Tải ảnh danh mục */}
            <div className="md:col-span-5 flex flex-col gap-3">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Ảnh danh mục
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Hiển thị trên bảng quản trị & khu vực Danh mục trang chủ
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={onFileInputChange}
              />

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
                {isUploading && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/85 backdrop-blur-xs gap-3">
                    <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-xs font-medium text-foreground">
                      Đang tải ảnh lên...
                    </span>
                  </div>
                )}

                {currentImageUrl ? (
                  <div
                    className="relative group w-full h-full flex items-center justify-center bg-black/5 dark:bg-black/30 p-2 cursor-pointer"
                    onClick={() => setIsImageModalOpen(true)}
                    title="Nhấn để xem ảnh phóng to"
                  >
                    <img
                      src={getAssetUrl(currentImageUrl)}
                      alt="Ảnh danh mục"
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
                  <div className="flex flex-col items-center justify-center p-5 text-center select-none">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2.5">
                      <UploadCloudIcon className="h-6 w-6" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-foreground">
                      Nhấn để tải ảnh danh mục
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      hoặc kéo & thả file vào đây
                    </p>
                    <span className="inline-block mt-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                      JPG, PNG, WEBP, GIF (Tối đa 5MB)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CỘT PHẢI (md:col-span-7): Thông tin danh mục */}
            <div className="md:col-span-7 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="edit-category-name"
                  className="text-sm font-medium text-foreground"
                >
                  Tên danh mục <span className="text-destructive">*</span>
                </label>
                <Input
                  id="edit-category-name"
                  aria-invalid={!!errors.name}
                  placeholder="Tên danh mục"
                  className="h-10"
                  {...register("name", {
                    required: "Vui lòng nhập tên danh mục",
                    minLength: {
                      value: 2,
                      message: "Tên danh mục phải có ít nhất 2 ký tự",
                    },
                  })}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="edit-category-slug"
                  className="text-sm font-medium text-foreground"
                >
                  Đường dẫn slug <span className="text-destructive">*</span>
                </label>
                <Input
                  id="edit-category-slug"
                  aria-invalid={!!errors.slug}
                  placeholder="duong-dan-danh-muc"
                  className="h-9 font-mono text-xs text-muted-foreground"
                  {...register("slug", {
                    required: "Vui lòng nhập slug",
                  })}
                />
                {errors.slug && (
                  <p className="text-xs text-destructive">
                    {errors.slug.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="edit-category-desc"
                  className="text-sm font-medium text-foreground"
                >
                  Mô tả danh mục
                </label>
                <textarea
                  id="edit-category-desc"
                  rows={5}
                  className="w-full rounded-xl border border-input bg-muted/10 px-3.5 py-2.5 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Thông tin mô tả về danh mục..."
                  {...register("description")}
                />
              </div>
            </div>
          </div>

          <Separator />

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
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </DialogFooter>
        </form>

        {currentImageUrl && (
          <ImageModal
            open={isImageModalOpen}
            onClose={() => setIsImageModalOpen(false)}
            src={currentImageUrl}
            title={
              watch("name")
                ? `Ảnh danh mục: ${watch("name")}`
                : "Xem ảnh danh mục"
            }
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
