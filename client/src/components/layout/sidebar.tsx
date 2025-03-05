import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  Wrench,
  Users,
  LogOut
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Equipment } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Sidebar() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: equipment } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment"],
  });

  const { user, isAdminOrManager } = useAuth();

  // Tính toán số lượng thiết bị theo trạng thái
  const activeCount = equipment?.filter(item => item.status === "Active").length || 0;
  const maintenanceCount = equipment?.filter(item => item.status === "Maintenance").length || 0;

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/logout");
      return res.json();
    },
    onSuccess: () => {
      queryClient.clear();
      navigate("/login");
      toast({
        title: "Đã đăng xuất",
      });
    },
  });

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md",
          location === href
            ? "bg-pink-100 text-pink-600"
            : "text-gray-600 hover:bg-gray-100"
        )}
      >
        {children}
      </a>
    </Link>
  );

  return (
    <div className="bg-white border-r min-h-screen fixed top-0 left-0 w-64">
      <div className="p-4">
        {/* User Info */}
        <div className="mb-8 p-4 border-b">
          <div className="flex items-center gap-3 mb-3">
            <Avatar>
              <AvatarFallback>
                {user?.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user?.fullName}</div>
              <div className="text-sm text-gray-500">{user?.username}</div>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full gap-2"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut size={16} />
            Đăng xuất
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-xl font-bold mb-6">Quản lý Thiết bị</h1>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-600">
                <span className="text-2xl font-bold">{activeCount}</span>
              </div>
              <span className="text-sm text-gray-600">Đang hoạt động</span>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-amber-600">
                <span className="text-2xl font-bold">{maintenanceCount}</span>
              </div>
              <span className="text-sm text-gray-600">Cần bảo trì</span>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          <NavLink href="/">
            <LayoutDashboard size={20} />
            Danh sách thiết bị
          </NavLink>
          <NavLink href="/departments">
            <Building2 size={20} />
            Phòng ban
          </NavLink>
          <NavLink href="/maintenance">
            <Wrench size={20} />
            Bảo trì
          </NavLink>
          {isAdminOrManager && (
            <NavLink href="/users">
              <Users size={20} />
              Quản lý người dùng
            </NavLink>
          )}
        </nav>
      </div>
    </div>
  );
}