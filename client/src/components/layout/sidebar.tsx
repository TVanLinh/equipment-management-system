import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  Wrench,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      "bg-white border-r min-h-screen relative transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-6 h-8 w-8 rounded-full border bg-white"
        onClick={() => setIsCollapsed(!isCollapsed)}
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
                  <span className="text-2xl font-bold">234</span>
                </div>
                <span className="text-sm text-gray-600">Đang hoạt động</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-amber-600">
                  <span className="text-2xl font-bold">18</span>
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