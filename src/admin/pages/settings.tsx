import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Cài đặt</h1>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Thông tin hệ thống</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Tên website</label>
            <Input defaultValue="Hỏi Dân IT" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Email liên hệ</label>
            <Input defaultValue="admin@hoidanit.vn" />
          </div>
          <Button className="w-fit">Lưu thay đổi</Button>
        </CardContent>
      </Card>
    </div>
  )
}
