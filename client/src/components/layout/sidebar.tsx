import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  Wrench,
  CircleDot,
  AlertTriangle
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

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
    <div className="w-64 bg-white border-r min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-6">Quản lý Thiết bị</h1>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <CircleDot size={16} />
              <span className="text-sm">Đang hoạt động</span>
            </div>
            <span className="text-2xl font-bold">234</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <AlertTriangle size={16} />
              <span className="text-sm">Cần bảo trì</span>
            </div>
            <span className="text-2xl font-bold">18</span>
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
  );
}