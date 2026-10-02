import { useState } from "react"
import { PlusIcon } from "lucide-react"
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

type CreateUserFormValues = {
  email: string
  password: string
  name: string
  phone: string
}

const EMPTY_FORM: CreateUserFormValues = {
  email: "",
  password: "",
  name: "",
  phone: "",
}

//controlled component vs uncontrolled component
export function CreateUserDialog({ onSuccess }: { onSuccess?: () => void } = {}) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    defaultValues: EMPTY_FORM,
  })

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) reset(EMPTY_FORM)
  }

  const onSubmit = async (data: CreateUserFormValues) => {
    try {
      await usersService.create(data)
      toast.success("Tạo người dùng thành công.")
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
          <Button>
            <PlusIcon />
            Thêm người dùng
          </Button>
        }
      />
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Thêm người dùng</DialogTitle>
            <DialogDescription>
              Nhập thông tin để tạo người dùng mới.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="create-user-email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="create-user-email"
                type="email"
                aria-invalid={!!errors.email}
                placeholder="user@example.com"
                {...register("email", {
                  required: "Vui lòng nhập email",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Email không hợp lệ",
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="create-user-password" className="text-sm font-medium">
                Mật khẩu
              </label>
              <Input
                id="create-user-password"
                type="password"
                aria-invalid={!!errors.password}
                placeholder="••••••••"
                {...register("password", {
                  required: "Vui lòng nhập mật khẩu",
                  minLength: {
                    value: 6,
                    message: "Mật khẩu phải có ít nhất 6 ký tự",
                  },
                })}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="create-user-name" className="text-sm font-medium">
                Họ tên
              </label>
              <Input
                id="create-user-name"
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
              <label htmlFor="create-user-phone" className="text-sm font-medium">
                Số điện thoại
              </label>
              <Input
                id="create-user-phone"
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
              {isSubmitting ? "Đang tạo..." : "Tạo người dùng"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
