import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  Wrench,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Equipment } from "@shared/schema";

interface SidebarProps {
  onCollapse?: (collapsed: boolean) => void;
}

export default function Sidebar({ onCollapse }: SidebarProps) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    onCollapse?.(!isCollapsed);
  };

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
      "bg-white border-r min-h-screen fixed top-0 left-0 transition-all duration-300 z-10",
      isCollapsed ? "w-20" : "w-64",
      isVisible ? "translate-x-0" : "-translate-x-full"
    )}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-6 h-8 w-8 rounded-full border bg-white"
        onClick={handleCollapse}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      <div className="p-4">
        <div className="mb-8">
          <h1 className={cn(
            "font-bold mb-6 transition-all duration-300",
            isCollapsed ? "text-center text-sm" : "text-xl"
          )}>
            {isCollapsed ? "EMS" : "Quản lý Thiết bị"}
          </h1>

          {!isCollapsed && (
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
          )}
        </div>

        <nav className="space-y-1">
          <NavLink href="/">
            <LayoutDashboard size={20} />
            {!isCollapsed && "Danh sách thiết bị"}
          </NavLink>
          <NavLink href="/departments">
            <Building2 size={20} />
            {!isCollapsed && "Phòng ban"}
          </NavLink>
          <NavLink href="/maintenance">
            <Wrench size={20} />
            {!isCollapsed && "Bảo trì"}
          </NavLink>
        </nav>
      </div>
    </div>
  );
}