import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import type { Equipment, Department } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Search, Filter } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function MobileEquipmentList() {
  const { isAdminOrManager } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  const { data: equipment, isLoading: isLoadingEquipment } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment"],
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  if (isLoadingEquipment) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const filteredEquipment = equipment?.filter((item) => {
    const matchesSearch =
      item.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
      item.equipmentId.toLowerCase().includes(search.toLowerCase()) ||
      item.model.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    const matchesDepartment =
      departmentFilter === "all" ||
      item.departmentId?.toString() === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getDepartmentName = (id: number | null) => {
    if (!id) return "Chưa phân phòng";
    return departments?.find((d) => d.id === id)?.name || "Không xác định";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-500">Hoạt động</Badge>;
      case "Maintenance":
        return <Badge className="bg-yellow-500">Đang bảo trì</Badge>;
      case "Inactive":
        return <Badge className="bg-gray-500">Không hoạt động</Badge>;
      case "PendingMaintenance":
        return <Badge className="bg-orange-500">Chờ bảo trì</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Thanh tìm kiếm */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm thiết bị..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Bộ lọc</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái</label>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="Active">Đang hoạt động</SelectItem>
                    <SelectItem value="Maintenance">Đang bảo trì</SelectItem>
                    <SelectItem value="Inactive">Không hoạt động</SelectItem>
                    <SelectItem value="PendingMaintenance">Chờ bảo trì</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phòng ban</label>
                <Select
                  value={departmentFilter}
                  onValueChange={setDepartmentFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng ban" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {departments?.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Danh sách thiết bị */}
      <div className="space-y-4">
        {filteredEquipment?.map((item) => (
          <Link key={item.id} href={`/equipment/${item.id}`}>
            <div className="border rounded-lg p-4 space-y-2 hover:border-primary transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{item.equipmentName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.equipmentId} - {item.model}
                  </p>
                </div>
                {getStatusBadge(item.status)}
              </div>

              <div className="text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Phòng ban:</span>{" "}
                  {getDepartmentName(item.departmentId)}
                </p>
                <p>
                  <span className="text-muted-foreground">Loại thiết bị:</span>{" "}
                  {item.equipmentType}
                </p>
                <p>
                  <span className="text-muted-foreground">Nhà sản xuất:</span>{" "}
                  {item.manufacturer}
                </p>
              </div>
            </div>
          </Link>
        ))}

        {filteredEquipment?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Không tìm thấy thiết bị nào
          </div>
        )}
      </div>
    </div>
  );
}
