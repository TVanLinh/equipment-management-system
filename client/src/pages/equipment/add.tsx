import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { insertEquipmentSchema } from "@shared/schema";
import type { InsertEquipment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AddEquipment() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<InsertEquipment>({
    resolver: zodResolver(insertEquipmentSchema),
    defaultValues: {
      equipmentId: "",
      equipmentName: "",
      equipmentType: "",
      model: "",
      serialNumber: "",
      countryOfOrigin: "",
      manufacturer: "",
      unitPrice: "0",
      vat: "0",
      fundingSource: "",
      supplier: "",
      status: "Active",
      purchaseDate: new Date().toISOString().split('T')[0],
      warrantyExpiry: new Date().toISOString().split('T')[0],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertEquipment) => {
      const res = await apiRequest("POST", "/api/equipment", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Thêm thiết bị thành công",
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Thêm thiết bị mới</h1>

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
              Thêm thiết bị
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}