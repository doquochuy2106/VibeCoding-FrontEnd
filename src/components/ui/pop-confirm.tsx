import { useState } from "react"
import { TriangleAlertIcon } from "lucide-react"

import { Button, type buttonVariants } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { VariantProps } from "class-variance-authority"

interface PopConfirmProps {
  children: React.ReactNode
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: VariantProps<typeof buttonVariants>["variant"]
  onConfirm: () => void | Promise<void>
}

export function PopConfirm({
  children,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  confirmVariant = "destructive",
  onConfirm,
}: PopConfirmProps) {
  const [open, setOpen] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  const handleConfirm = async () => {
    setIsConfirming(true)
    await onConfirm()
    setIsConfirming(false)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={children as React.ReactElement} />
      <PopoverContent className="w-64">
        <div className="flex gap-2.5">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="flex flex-col gap-1">
            <p className="font-medium">{title}</p>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        </div>

        <div className="mt-3 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isConfirming}
            onClick={() => setOpen(false)}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            size="sm"
            disabled={isConfirming}
            onClick={handleConfirm}
          >
            {isConfirming ? "Đang xử lý..." : confirmText}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
