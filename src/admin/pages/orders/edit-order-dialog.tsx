import { useEffect, useState } from "react"
import {
  PencilIcon,
  Loader2Icon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircle2Icon,
} from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { Badge } from "@/components/ui/badge"
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
import {
  ordersService,
  ORDER_STATUS_CONFIG,
  type Order,
  type OrderStatus,
} from "@/services/orders.service"
import { ApiError } from "@/lib/http-client"

type EditOrderFormValues = {
  status: OrderStatus
  customerName: string
  customerPhone: string
  shippingAddress: string
}

const STATUS_OPTIONS: {
  value: OrderStatus
  label: string
  desc: string
}[] = [
  {
    value: "PENDING",
    label: "Chờ xác nhận",
    desc: "Đơn hàng mới tạo, đang chờ kiểm tra & xác nhận",
  },
  {
    value: "CONFIRMED",
    label: "Đã xác nhận",
    desc: "Đã xác nhận đơn hàng và chuẩn bị đóng gói",
  },
  {
    value: "SHIPPED",
    label: "Đang giao hàng",
    desc: "Đã bàn giao cho đơn vị vận chuyển",
  },
  {
    value: "COMPLETED",
    label: "Hoàn thành",
    desc: "Khách hàng đã nhận hàng và thanh toán thành công",
  },
  {
    value: "CANCELLED",
    label: "Đã hủy",
    desc: "Hủy đơn hàng và tự động hoàn lại số lượng tồn kho",
  },
]

export function EditOrderDialog({
  order,
  onSuccess,
}: {
  order: Order
  onSuccess?: () => void
}) {
  const [open, setOpen] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditOrderFormValues>({
    defaultValues: {
      status: order.status,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        status: order.status,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        shippingAddress: order.shippingAddress,
      })
    }
  }, [open, order, reset])

  const selectedStatus = watch("status")
  const currentConfig =
    ORDER_STATUS_CONFIG[selectedStatus] ?? ORDER_STATUS_CONFIG.PENDING

  const onSubmit = async (values: EditOrderFormValues) => {
    try {
      await ordersService.update(order.id, {
        status: values.status,
        customerName: values.customerName.trim(),
        customerPhone: values.customerPhone.trim(),
        shippingAddress: values.shippingAddress.trim(),
      })
      toast.success(`Cập nhật đơn hàng #${order.id} thành công!`)
      setOpen(false)
      onSuccess?.()
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Không thể cập nhật đơn hàng, vui lòng thử lại."
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sửa đơn hàng"
            title="Sửa đơn hàng & Trạng thái"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
        }
      />

      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border">
          <div className="flex items-center justify-between gap-2 pr-6">
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                <span>Sửa đơn hàng #{order.id}</span>
                <Badge
                  variant={currentConfig.badgeVariant}
                  className={currentConfig.className}
                >
                  {currentConfig.label}
                </Badge>
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs">
                Thay đổi trạng thái xử lý đơn hàng hoặc cập nhật thông tin giao hàng
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Trạng thái đơn hàng */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Trạng thái đơn hàng <span className="text-destructive">*</span>
              </label>

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        if (val) field.onChange(val as OrderStatus)
                      }}
                    >
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Chọn trạng thái đơn hàng" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Quick status buttons */}
                    <div className="grid grid-cols-1 gap-1.5 pt-1">
                      {STATUS_OPTIONS.map((opt) => {
                        const isSelected = field.value === opt.value
                        const cfg = ORDER_STATUS_CONFIG[opt.value]
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => field.onChange(opt.value)}
                            className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition-all cursor-pointer ${
                              isSelected
                                ? "border-primary bg-primary/10 shadow-2xs"
                                : "border-border/70 bg-card hover:bg-muted/50"
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={cfg.badgeVariant}
                                  className={`text-[11px] ${cfg.className}`}
                                >
                                  {opt.label}
                                </Badge>
                              </div>
                              <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {opt.desc}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle2Icon className="h-4 w-4 text-primary shrink-0" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              />
            </div>

            {/* Họ tên người nhận */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <UserIcon className="h-3.5 w-3.5 text-primary" />
                <span>Họ và tên người nhận</span>
                <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Nhập họ tên người nhận"
                {...register("customerName", {
                  required: "Vui lòng nhập họ và tên người nhận",
                })}
              />
              {errors.customerName && (
                <p className="text-xs text-destructive">
                  {errors.customerName.message}
                </p>
              )}
            </div>

            {/* Số điện thoại */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <PhoneIcon className="h-3.5 w-3.5 text-primary" />
                <span>Số điện thoại liên hệ</span>
                <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Nhập số điện thoại"
                {...register("customerPhone", {
                  required: "Vui lòng nhập số điện thoại",
                })}
              />
              {errors.customerPhone && (
                <p className="text-xs text-destructive">
                  {errors.customerPhone.message}
                </p>
              )}
            </div>

            {/* Địa chỉ giao hàng */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <MapPinIcon className="h-3.5 w-3.5 text-primary" />
                <span>Địa chỉ giao hàng</span>
                <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Nhập địa chỉ nhận hàng"
                {...register("shippingAddress", {
                  required: "Vui lòng nhập địa chỉ giao hàng",
                })}
              />
              {errors.shippingAddress && (
                <p className="text-xs text-destructive">
                  {errors.shippingAddress.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="px-6 py-3.5 border-t border-border bg-muted/20">
            <DialogClose
              render={
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Hủy
                </Button>
              }
            />
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              )}
              <span>Lưu thay đổi</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
