import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import type { Equipment } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEquipmentSchema } from "@shared/schema";
import type { InsertEquipment } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function EquipmentDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: equipment, isLoading } = useQuery<Equipment>({
    queryKey: [`/api/equipment/${id}`],
  });

  const mutation = useMutation({
    mutationFn: async (data: Partial<InsertEquipment>) => {
      const res = await apiRequest("PATCH", `/api/equipment/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Cập nhật thông tin thiết bị thành công",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/equipment/${id}`] });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertEquipment>({
    resolver: zodResolver(insertEquipmentSchema),
    defaultValues: equipment,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!equipment) return <div>Không tìm thấy thiết bị</div>;

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

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-pink-500 hover:bg-pink-600 gap-2">
              <Edit className="h-4 w-4" />
              Chỉnh sửa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa thông tin thiết bị</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="equipmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã thiết bị</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="equipmentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên thiết bị</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="equipmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại thiết bị</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ký hiệu máy</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serialNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số serial</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="countryOfOrigin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nước sản xuất</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="manufacturer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hãng sản xuất</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unitPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đơn giá</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thuế VAT (%)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fundingSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nguồn kinh phí</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="supplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nhà cung cấp</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tình trạng</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn tình trạng" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">Hoạt động</SelectItem>
                            <SelectItem value="Maintenance">Bảo trì</SelectItem>
                            <SelectItem value="Inactive">Không hoạt động</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="purchaseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày mua</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="warrantyExpiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày hết hạn bảo hành</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4 justify-end">
                  <Button type="submit" className="bg-pink-500 hover:bg-pink-600" disabled={mutation.isPending}>
                    Cập nhật
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
                <dd>{equipment.status === 'Active' ? 'Hoạt động' : 'Bảo trì'}</dd>
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
    </div>
  );
}