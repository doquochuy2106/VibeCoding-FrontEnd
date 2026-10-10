import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 350)
    return () => clearTimeout(timer)
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success("Đã lưu cấu hình hệ thống thành công!")
    }, 450)
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Cài đặt hệ thống</h1>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>
            {loading ? (
              <Skeleton className="h-5 w-44 rounded" />
            ) : (
              "Thông tin hệ thống"
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading || saving ? (
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <Skeleton className="h-9 w-32 rounded-md mt-1" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Tên website</label>
                <Input defaultValue="GEN.G Official Store" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Email liên hệ</label>
                <Input defaultValue="support@geng.gg" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Hotline CSKH</label>
                <Input defaultValue="1900 6868" />
              </div>
              <Button type="submit" className="w-fit cursor-pointer">
                Lưu thay đổi
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
