import { useQuery } from "@tanstack/react-query";

interface User {
  id: number;
  username: string;
  role: 'admin' | 'manager' | 'user';
  departmentId: number;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    retry: false,
    onError: (error) => {
      console.error("Auth error:", error);
    },
    onSuccess: (data) => {
      console.log("Auth successful:", data);
    }
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