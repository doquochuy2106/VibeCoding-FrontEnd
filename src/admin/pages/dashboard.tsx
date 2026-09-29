import { Users, ShoppingCart, DollarSign, TrendingUp } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const stats = [
  {
    title: "Tổng doanh thu",
    value: "125.000.000đ",
    change: "+12.5%",
    icon: DollarSign,
  },
  { title: "Đơn hàng", value: "1.240", change: "+8.2%", icon: ShoppingCart },
  { title: "Người dùng mới", value: "324", change: "+3.1%", icon: Users },
  { title: "Tỉ lệ tăng trưởng", value: "18.4%", change: "+2.4%", icon: TrendingUp },
]

const recentOrders = [
  { id: "DH001", customer: "Nguyễn Văn A", amount: "1.200.000đ", status: "Hoàn thành" },
  { id: "DH002", customer: "Trần Thị B", amount: "850.000đ", status: "Đang xử lý" },
  { id: "DH003", customer: "Lê Văn C", amount: "2.100.000đ", status: "Hoàn thành" },
  { id: "DH004", customer: "Phạm Thị D", amount: "450.000đ", status: "Đã huỷ" },
  { id: "DH005", customer: "Hoàng Văn E", amount: "3.000.000đ", status: "Đang xử lý" },
]

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  "Hoàn thành": "default",
  "Đang xử lý": "secondary",
  "Đã huỷ": "destructive",
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
                <stat.icon className="h-4 w-4 text-accent-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-2xl font-semibold tabular-nums">
                {stat.value}
              </div>
              <p className="text-xs text-success">
                {stat.change} so với tháng trước
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Giá trị</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {order.id}
                  </TableCell>
                  <TableCell className="font-medium">{order.customer}</TableCell>
                  <TableCell className="font-mono tabular-nums">{order.amount}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[order.status]}>
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
