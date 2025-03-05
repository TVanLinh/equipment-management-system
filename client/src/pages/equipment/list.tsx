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
import { Plus, Search, SlidersHorizontal, Upload, Loader2 } from "lucide-react";
import type { Equipment } from "@shared/schema";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function EquipmentList() {
  const { data: equipment, isLoading } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment"],
  });

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

    // Check file type
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Danh sách thiết bị</h1>
        <div className="flex gap-2">
          <Dialog>
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
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input placeholder="Tìm kiếm thiết bị..." className="pl-10" />
        </div>
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal size={20} />
          Bộ lọc
        </Button>
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
            {equipment?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.equipmentId}</TableCell>
                <TableCell>{item.equipmentName}</TableCell>
                <TableCell>{item.departmentId}</TableCell>
                <TableCell>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    item.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  )}>
                    {item.status}
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
    </div>
  );
}