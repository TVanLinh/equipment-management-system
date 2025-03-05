import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import type { Equipment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Schema cho form yêu cầu bảo trì
const maintenanceRequestSchema = z.object({
  reason: z.string().min(1, "Vui lòng nhập lý do yêu cầu bảo trì"),
  notes: z.string().optional(),
});

type MaintenanceRequestForm = z.infer<typeof maintenanceRequestSchema>;

export default function MaintenanceRequest() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: equipment, isLoading } = useQuery<Equipment>({
    queryKey: [`/api/equipment/${id}`],
  });

  const form = useForm<MaintenanceRequestForm>({
    resolver: zodResolver(maintenanceRequestSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: MaintenanceRequestForm) => {
      const res = await apiRequest("POST", "/api/maintenance", {
        equipmentId: Number(id),
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(), // Sẽ được cập nhật khi hoàn thành
        maintenanceType: "Corrective",
        reason: data.reason,
        notes: data.notes,
        status: "Pending"
      });

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã gửi yêu cầu bảo trì",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/equipment/${id}`] });
      navigate(`/equipment/${id}`);
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!equipment) {
    return <div>Không tìm thấy thiết bị</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/equipment/${id}`}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Yêu cầu bảo trì thiết bị</h1>
      </div>

      <div className="mb-6">
        <h2 className="font-medium mb-2">Thông tin thiết bị:</h2>
        <p>Mã thiết bị: {equipment.equipmentId}</p>
        <p>Tên thiết bị: {equipment.equipmentName}</p>
        <p>Trạng thái: {equipment.status}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lý do yêu cầu bảo trì</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ghi chú thêm (không bắt buộc)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            Gửi yêu cầu bảo trì
          </Button>
        </form>
      </Form>
    </div>
  );
}