import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Wrench, Loader2 } from "lucide-react";
import type { Equipment, Department, Maintenance } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function EquipmentDetails() {
  const { id } = useParams();
  const { isAdminOrManager } = useAuth();

  const { data: equipment, isLoading, error } = useQuery<Equipment>({
    queryKey: [`/api/equipment/${id}`],
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: maintenanceHistory, isLoading: isLoadingMaintenance } = useQuery<Maintenance[]>({
    queryKey: [`/api/equipment/${id}/maintenance`],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            {(error as any)?.message || "Không thể tải thông tin thiết bị"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>
        <Alert>
          <AlertDescription>
            Không tìm thấy thiết bị
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Lấy tên phòng ban
  const department = departments?.find(d => d.id === equipment.departmentId);

  // Kiểm tra xem có thể yêu cầu bảo trì không
  const canRequestMaintenance = equipment.status === "Active";
  const maintenanceStatus = equipment.status === "PendingMaintenance" ? "Đang chờ phê duyệt" :
                           equipment.status === "Maintenance" ? "Đang bảo trì" :
                           equipment.status === "Active" ? "Hoạt động" : "Không hoạt động";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Chi tiết thiết bị</h1>
        </div>

        <div className="flex gap-2">
          {!isAdminOrManager && (
            <Link href={`/maintenance/request/${id}`}>
              <Button 
                className="bg-amber-500 hover:bg-amber-600 gap-2"
                disabled={!canRequestMaintenance}
              >
                <Wrench className="h-4 w-4" />
                {canRequestMaintenance ? "Yêu cầu bảo trì" : "Đã yêu cầu bảo trì"}
              </Button>
            </Link>
          )}

          {isAdminOrManager && (
            <Link href={`/equipment/${id}/edit`}>
              <Button className="bg-pink-500 hover:bg-pink-600 gap-2">
                <Edit className="h-4 w-4" />
                Chỉnh sửa
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">Mã thiết bị</dt>
                <dd>{equipment.equipmentId}</dd>
              </div>
              <div>
                <dt className="font-medium">Tên thiết bị</dt>
                <dd>{equipment.equipmentName}</dd>
              </div>
              <div>
                <dt className="font-medium">Loại thiết bị</dt>
                <dd>{equipment.equipmentType}</dd>
              </div>
              <div>
                <dt className="font-medium">Ký hiệu máy</dt>
                <dd>{equipment.model}</dd>
              </div>
              <div>
                <dt className="font-medium">Số serial</dt>
                <dd>{equipment.serialNumber}</dd>
              </div>
              <div>
                <dt className="font-medium">Phòng ban</dt>
                <dd>{department?.name || "Chưa phân phòng"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin sản xuất</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">Hãng sản xuất</dt>
                <dd>{equipment.manufacturer}</dd>
              </div>
              <div>
                <dt className="font-medium">Nước sản xuất</dt>
                <dd>{equipment.countryOfOrigin}</dd>
              </div>
              <div>
                <dt className="font-medium">Nhà cung cấp</dt>
                <dd>{equipment.supplier}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin tài chính</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">Đơn giá</dt>
                <dd>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(equipment.unitPrice))}</dd>
              </div>
              <div>
                <dt className="font-medium">Thuế VAT</dt>
                <dd>{equipment.vat}%</dd>
              </div>
              <div>
                <dt className="font-medium">Nguồn kinh phí</dt>
                <dd>{equipment.fundingSource}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trạng thái & Thời hạn</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">Trạng thái</dt>
                <dd>{maintenanceStatus}</dd>
              </div>
              <div>
                <dt className="font-medium">Ngày mua</dt>
                <dd>{new Date(equipment.purchaseDate).toLocaleDateString('vi-VN')}</dd>
              </div>
              <div>
                <dt className="font-medium">Ngày hết hạn bảo hành</dt>
                <dd>{new Date(equipment.warrantyExpiry).toLocaleDateString('vi-VN')}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Lịch sử bảo trì */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử bảo trì</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingMaintenance ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : maintenanceHistory?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Chưa có lịch sử bảo trì
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày bắt đầu</TableHead>
                    <TableHead>Ngày kết thúc</TableHead>
                    <TableHead>Loại bảo trì</TableHead>
                    <TableHead>Người thực hiện</TableHead>
                    <TableHead>Ghi chú</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceHistory?.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{new Date(record.startDate).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>{new Date(record.endDate).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>{record.maintenanceType}</TableCell>
                      <TableCell>{record.performedBy}</TableCell>
                      <TableCell>{record.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}