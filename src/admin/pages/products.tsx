import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

const products = [
  { id: 1, name: "Áo thun basic", price: "150.000đ", stock: 120, status: "Còn hàng" },
  { id: 2, name: "Quần jean slim", price: "450.000đ", stock: 0, status: "Hết hàng" },
  { id: 3, name: "Giày sneaker", price: "890.000đ", stock: 34, status: "Còn hàng" },
  { id: 4, name: "Túi xách mini", price: "320.000đ", stock: 8, status: "Sắp hết" },
]

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  "Còn hàng": "default",
  "Hết hàng": "destructive",
  "Sắp hết": "secondary",
}

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sản phẩm</h1>
        <Button>
          <Plus className="h-4 w-4" />
          Thêm sản phẩm
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.price}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
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
