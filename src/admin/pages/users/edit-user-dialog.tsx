import { useState, useRef } from "react"
import {
  PencilIcon,
  UploadCloudIcon,
  Loader2Icon,
  Trash2Icon,
  UserIcon,
  CameraIcon,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageModal } from "@/components/ui/image-modal"
import { usersService } from "@/services/users.service"
import { uploadService } from "@/services/upload.service"
import { ApiError } from "@/lib/http-client"
import { getAssetUrl } from "@/lib/utils"
import { roleLabel, type User } from "./columns"

type EditUserFormValues = {
  name: string
  phone: string
  avatar?: string
  role: User["role"]
}

export function EditUserDialog({
  user,
  onSuccess,
}: {
  user: User
  onSuccess?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const defaultValues: EditUserFormValues = {
    name: user.name ?? "",
    phone: user.phone ?? "",
    avatar: user.avatar ?? "",
    role: user.role,
  }

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditUserFormValues>({ defaultValues })

  const currentAvatar = watch("avatar")

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) {
      reset({
        name: user.name ?? "",
        phone: user.phone ?? "",
        avatar: user.avatar ?? "",
        role: user.role,
      })
      setIsImageModalOpen(false)
    } else {
      setIsUploading(false)
      setIsDragging(false)
      setIsImageModalOpen(false)
    }
  }

  const uploadAvatarFile = async (file: File) => {
    if (!file) return

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      toast.error("Vui lòng chọn file hình ảnh (JPG, PNG, WEBP, GIF)!")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dung lượng avatar tối đa là 5MB!")
      return
    }

    try {
      setIsUploading(true)
      const res = await uploadService.uploadUserAvatar(file)
      setValue("avatar", res.url, { shouldValidate: true })
      toast.success("Tải ảnh đại diện lên thành công!")
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Tải ảnh thất bại, vui lòng thử lại."
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadAvatarFile(file)
    }
    e.target.value = ""
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      uploadAvatarFile(file)
    }
  }

  const handleRemoveAvatar = () => {
    setValue("avatar", "")
  }

  const onSubmit = async (data: EditUserFormValues) => {
    try {
      await usersService.update(user.id, {
        name: data.name.trim(),
        phone: data.phone.trim(),
        avatar: data.avatar?.trim() || undefined,
        role: data.role,
      })
      toast.success("Cập nhật người dùng thành công.")
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
          <Button variant="ghost" size="icon" aria-label="Sửa người dùng" />
        }
      >
        <PencilIcon />
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl w-[92vw] max-h-[90vh] overflow-y-auto p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Sửa người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin và ảnh đại diện của người dùng #{user.id}.
            </DialogDescription>
          </DialogHeader>

          {/* Phần Avatar & Preview với hỗ trợ Kéo & Thả */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
              isDragging
                ? "border-primary bg-primary/10 scale-[0.99] border-dashed"
                : "border-border bg-muted/20"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={handleFileInputChange}
            />

            <div className="relative group shrink-0">
              <div
                onClick={() => {
                  if (currentAvatar) {
                    setIsImageModalOpen(true)
                  } else {
                    fileInputRef.current?.click()
                  }
                }}
                className={`relative h-20 w-20 rounded-full border-2 border-dashed transition-all cursor-pointer overflow-hidden flex items-center justify-center shadow-xs ${
                  isDragging
                    ? "border-primary bg-primary/20 scale-105"
                    : "border-primary/40 bg-muted hover:border-primary"
                }`}
                title={
                  currentAvatar
                    ? "Nhấn để xem ảnh phóng to hoặc kéo thả file để đổi"
                    : "Nhấn hoặc kéo thả file để thay đổi ảnh đại diện"
                }
              >
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center bg-background/80 inset-0 absolute">
                    <Loader2Icon className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : currentAvatar ? (
                  <img
                    src={getAssetUrl(currentAvatar)}
                    alt="Avatar"
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = ""
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                    <UserIcon className="h-8 w-8" />
                  </div>
                )}

                {!isUploading && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    {currentAvatar ? (
                      <EyeIcon className="h-5 w-5" />
                    ) : (
                      <CameraIcon className="h-5 w-5" />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
              <span className="text-sm font-medium">Ảnh đại diện (Avatar)</span>
              <p className="text-xs text-muted-foreground">
                {isDragging
                  ? "Thả file ảnh vào đây để tải lên..."
                  : "Kéo & thả ảnh vào đây hoặc nhấn chọn file (JPG, PNG, WEBP tối đa 5MB)."}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="h-7 text-xs gap-1"
                >
                  <UploadCloudIcon className="h-3.5 w-3.5" />
                  {currentAvatar ? "Đổi avatar" : "Chọn ảnh"}
                </Button>
                {currentAvatar && (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsImageModalOpen(true)}
                      disabled={isUploading}
                      className="h-7 text-xs gap-1"
                    >
                      <EyeIcon className="h-3.5 w-3.5" />
                      Xem ảnh
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      disabled={isUploading}
                      className="h-7 text-xs text-destructive hover:text-destructive gap-1 px-2"
                    >
                      <Trash2Icon className="h-3.5 w-3.5" />
                      Xóa
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label htmlFor="edit-user-email" className="text-sm font-medium text-muted-foreground">
                Email (Không thể thay đổi)
              </label>
              <Input
                id="edit-user-email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted/50 cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label htmlFor="edit-user-name" className="text-sm font-medium">
                Họ và tên <span className="text-destructive">*</span>
              </label>
              <Input
                id="edit-user-name"
                aria-invalid={!!errors.name}
                placeholder="Nguyễn Văn A"
                {...register("name", {
                  required: "Vui lòng nhập họ tên",
                })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-user-phone" className="text-sm font-medium">
                Số điện thoại <span className="text-destructive">*</span>
              </label>
              <Input
                id="edit-user-phone"
                aria-invalid={!!errors.phone}
                placeholder="0912345678"
                {...register("phone", {
                  required: "Vui lòng nhập số điện thoại",
                  pattern: {
                    value: /^[0-9]{9,11}$/,
                    message: "Số điện thoại không hợp lệ (9-11 chữ số)",
                  },
                })}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-user-role" className="text-sm font-medium">
                Vai trò
              </label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      if (val) field.onChange(val)
                    }}
                  >
                    <SelectTrigger id="edit-user-role" className="w-full">
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleLabel).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-2">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting || isUploading}
                >
                  Hủy
                </Button>
              }
            />
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>

        {currentAvatar && (
          <ImageModal
            open={isImageModalOpen}
            onClose={() => setIsImageModalOpen(false)}
            src={currentAvatar}
            title={watch("name") ? `Ảnh đại diện: ${watch("name")}` : "Xem ảnh đại diện"}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
