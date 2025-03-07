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
import { Plus, KeyRound, Search, Upload, Download } from "lucide-react";
import type { User, Department } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Schema cho form reset password
const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function UserList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const resetPasswordForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, newPassword }: { id: number; newPassword: string }) => {
      const res = await apiRequest("POST", `/api/users/${id}/reset-password`, { newPassword });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Đặt lại mật khẩu thành công",
      });
      setIsResetPasswordOpen(false);
      resetPasswordForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/users/import', {
        method: 'POST',
        body: formData,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.errors?.length > 0) {
        // Show error toast with details
        toast({
          title: "Import không thành công",
          description: (
            <div className="mt-2 space-y-2">
              <p>Đã import {data.imported} người dùng. Có {data.errors.length} lỗi:</p>
              <ul className="list-disc pl-4 space-y-1 max-h-40 overflow-y-auto">
                {data.errors.slice(0, 5).map((error: any, index: number) => (
                  <li key={index} className="text-sm">
                    {error.error}
                  </li>
                ))}
                {data.errors.length > 5 && (
                  <li className="text-sm font-medium">
                    ... và {data.errors.length - 5} lỗi khác
                  </li>
                )}
              </ul>
            </div>
          ),
          variant: "destructive",
          duration: 10000,
        });
      } else {
        toast({
          title: "Import thành công",
          description: `Đã import ${data.imported} người dùng.`,
        });
      }
      setIsImportDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleResetPassword = (userId: number) => {
    setSelectedUserId(userId);
    setIsResetPasswordOpen(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importMutation.mutate(file);
    }
  };

  const handleDownloadTemplate = () => {
    window.location.href = '/user-template.xlsx';
  };

  const filteredUsers = users?.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Lấy tên phòng ban từ ID
  const getDepartmentName = (departmentId: number | null) => {
    if (!departmentId) return "Chưa phân phòng";
    const department = departments?.find(d => d.id === departmentId);
    return department?.name || "Không tìm thấy";
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Danh sách người dùng</h1>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Tải template
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => window.location.href = '/user-template.xlsx'}>
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = '/user-template.csv'}>
                CSV (.csv)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setIsImportDialogOpen(true)} variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Link href="/users/add">
            <Button className="bg-pink-500 hover:bg-pink-600">
              <Plus className="mr-2 h-4 w-4" />
              Thêm người dùng
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Tìm kiếm người dùng..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên đăng nhập</TableHead>
              <TableHead>Tên đầy đủ</TableHead>
              <TableHead>Khoa</TableHead>
              <TableHead>Quyền</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{getDepartmentName(user.departmentId)}</TableCell>
                <TableCell>
                  {user.role === 'admin' ? 'Quản trị viên' :
                    user.role === 'manager' ? 'Quản lý' : 'Người dùng'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleResetPassword(user.id)}
                  >
                    <KeyRound className="h-4 w-4" />
                    Đặt lại mật khẩu
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đặt lại mật khẩu</DialogTitle>
            <DialogDescription>
              Nhập mật khẩu mới cho người dùng này
            </DialogDescription>
          </DialogHeader>
          <Form {...resetPasswordForm}>
            <form
              onSubmit={resetPasswordForm.handleSubmit((data) => {
                if (selectedUserId) {
                  resetPasswordMutation.mutate({
                    id: selectedUserId,
                    newPassword: data.newPassword,
                  });
                }
              })}
              className="space-y-4"
            >
              <FormField
                control={resetPasswordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu mới</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={resetPasswordMutation.isPending}
              >
                Xác nhận
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import người dùng</DialogTitle>
            <DialogDescription>
              Chọn file Excel hoặc CSV để import danh sách người dùng
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              disabled={importMutation.isPending}
            />
            <p className="text-sm text-gray-500">
              Tải template mẫu để xem cấu trúc file import (hỗ trợ cả Excel và CSV)
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}