import { useState } from "react"
import { PencilIcon } from "lucide-react"
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
import { usersService } from "@/services/users.service"
import { ApiError } from "@/lib/http-client"
import type { User } from "./columns"

type EditUserFormValues = {
  name: string
  phone: string
}

export function EditUserDialog({
  user,
  onSuccess,
}: {
  user: User
  onSuccess?: () => void
}) {
  const [open, setOpen] = useState(false)

  const defaultValues: EditUserFormValues = {
    name: user.name ?? "",
    phone: user.phone ?? "",
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditUserFormValues>({ defaultValues })

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) reset(defaultValues)
  }

  const onSubmit = async (data: EditUserFormValues) => {
    try {
      await usersService.update(user.id, data)
      toast.success("Cập nhật người dùng thành công.")
      handleOpenChange(false)
      onSuccess?.()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Đã có lỗi xảy ra, vui lòng thử lại."
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
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Sửa người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin của người dùng.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-user-email" className="text-sm font-medium">
                Email
              </label>
              <Input id="edit-user-email" type="email" value={user.email} disabled />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-user-name" className="text-sm font-medium">
                Họ tên
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
                Số điện thoại
              </label>
              <Input
                id="edit-user-phone"
                aria-invalid={!!errors.phone}
                placeholder="123456789"
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
