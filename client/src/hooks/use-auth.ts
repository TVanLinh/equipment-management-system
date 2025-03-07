import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface AuthUser {
  id: number;
  username: string;
  role: 'admin' | 'manager' | 'user';
  fullName: string;
  departmentId: number | null;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<AuthUser>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isAdminOrManager = isAdmin || isManager;

  return {
    user,
    isLoading,
    isAdmin,
    isManager,
    isAdminOrManager,
  };
}