import { useEffect } from "react"
import { createPortal } from "react-dom"
import { XIcon, ExternalLinkIcon, ZoomInIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getAssetUrl } from "@/lib/utils"

interface ImageModalProps {
  open: boolean
  onClose: () => void
  src?: string | null
  alt?: string
  title?: string
}

export function ImageModal({
  open,
  onClose,
  src,
  alt = "Hình ảnh",
  title = "Xem chi tiết hình ảnh",
}: ImageModalProps) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose])

  if (!open || !src) return null

  const fullUrl = getAssetUrl(src)

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in-0 duration-150"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col max-w-4xl max-h-[92vh] w-full rounded-2xl bg-card border border-border/80 shadow-2xl overflow-hidden p-3 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <ZoomInIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={fullUrl}
              target="_blank"
              rel="noreferrer"
              title="Mở ảnh gốc trong tab mới"
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLinkIcon className="h-4 w-4" />
            </a>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
              title="Đóng (Esc)"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Khung hiển thị ảnh */}
        <div className="relative flex items-center justify-center p-3 overflow-hidden bg-black/10 dark:bg-black/40 rounded-xl my-2 max-h-[78vh]">
          <img
            src={fullUrl}
            alt={alt}
            className="max-h-[72vh] max-w-full w-auto h-auto object-contain rounded-lg select-none shadow-md"
            onError={(e) => {
              e.currentTarget.style.display = "none"
            }}
          />
        </div>
      </div>
    </div>,
    document.body
  )
}
