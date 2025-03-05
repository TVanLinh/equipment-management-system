import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  Wrench
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Equipment } from "@shared/schema";

export default function Sidebar() {
  const [location] = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { data: equipment } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment"],
  });

  // Tính toán số lượng thiết bị theo trạng thái
  const activeCount = equipment?.filter(item => item.status === "Active").length || 0;
  const maintenanceCount = equipment?.filter(item => item.status === "Maintenance").length || 0;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else {
        setIsVisible(currentScrollY < lastScrollY);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);


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
    <div className={cn(
      "bg-white border-r min-h-screen fixed top-0 left-0 w-64 transition-all duration-300 z-10",
      isVisible ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-4">
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
        </nav>
      </div>
    </div>
  );
}