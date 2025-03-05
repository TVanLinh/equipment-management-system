import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, SlidersHorizontal, Upload, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Equipment, Department } from "@shared/schema";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

export default function EquipmentList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState("50");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const { data: equipment, isLoading } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment"],
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { isAdminOrManager } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/equipment/import', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Import thành công",
        description: `Đã import ${data.imported} thiết bị vào hệ thống`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      setIsImportDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file Excel (.xlsx) hoặc CSV",
        variant: "destructive",
      });
      return;
    }

    importMutation.mutate(file);
  };

  const filteredEquipment = equipment?.filter((item) => {
    const matchesSearch = item.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       item.equipmentId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Phân trang
  const totalItems = filteredEquipment?.length || 0;
  const totalPages = Math.ceil(totalItems / Number(itemsPerPage));
  const startIndex = (currentPage - 1) * Number(itemsPerPage);
  const endIndex = startIndex + Number(itemsPerPage);
  const currentItems = filteredEquipment?.slice(startIndex, endIndex);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Hàm lấy tên phòng ban từ ID
  const getDepartmentName = (departmentId: number | null) => {
    if (!departmentId) return "Chưa phân phòng";
    const department = departments?.find(d => d.id === departmentId);
    return department?.name || "Không tìm thấy";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Danh sách thiết bị</h1>
        {isAdminOrManager && (
          <div className="flex gap-2">
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2" disabled={importMutation.isPending}>
                  {importMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload size={20} />
                  )}
                  Import
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import thiết bị từ file</DialogTitle>
                  <DialogDescription>
                    Chọn file Excel (.xlsx) hoặc CSV chứa danh sách thiết bị để import
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input
                    type="file"
                    accept=".xlsx,.csv"
                    onChange={handleFileUpload}
                    disabled={importMutation.isPending}
                  />
                  <div className="text-sm text-muted-foreground">
                    Tải file mẫu:
                    <a href="/template.xlsx" className="text-pink-500 hover:underline ml-1">template.xlsx</a>
                    <span className="mx-1">hoặc</span>
                    <a href="/template.csv" className="text-pink-500 hover:underline">template.csv</a>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Link href="/equipment/add">
              <Button className="bg-pink-500 hover:bg-pink-600">
                <Plus className="mr-2 h-4 w-4" />
                Thêm thiết bị
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input 
            placeholder="Tìm kiếm thiết bị..." 
            className="pl-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Số mục hiển thị" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="50">50 mục</SelectItem>
            <SelectItem value="100">100 mục</SelectItem>
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal size={20} />
              Bộ lọc
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Trạng thái</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
              <DropdownMenuRadioItem value="all">Tất cả</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Active">Đang hoạt động</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Maintenance">Bảo trì</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Inactive">Không hoạt động</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã thiết bị</TableHead>
              <TableHead>Tên thiết bị</TableHead>
              <TableHead>Khoa</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày bảo trì</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.equipmentId}</TableCell>
                <TableCell>{item.equipmentName}</TableCell>
                <TableCell>{getDepartmentName(item.departmentId)}</TableCell>
                <TableCell>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    item.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : item.status === "Maintenance"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-gray-100 text-gray-700"
                  )}>
                    {item.status === "Active" ? "Đang hoạt động" : 
                     item.status === "Maintenance" ? "Bảo trì" : 
                     "Không hoạt động"}
                  </span>
                </TableCell>
                <TableCell>{new Date(item.warrantyExpiry).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell>
                  <Link href={`/equipment/${item.id}`}>
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      Chi tiết
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Phân trang */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Hiển thị {startIndex + 1}-{Math.min(endIndex, totalItems)} trên tổng số {totalItems} thiết bị
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}