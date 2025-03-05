import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/layout/sidebar";
import NotFound from "@/pages/not-found";
import EquipmentList from "@/pages/equipment/list";
import EquipmentDetails from "@/pages/equipment/details";
import EditEquipment from "@/pages/equipment/edit";
import AddEquipment from "@/pages/equipment/add";
import DepartmentList from "@/pages/departments/list";
import MaintenanceList from "@/pages/maintenance/list";
import Login from "@/pages/auth/login";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const { isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  useEffect(() => {
    if (error) {
      navigate("/login");
    }
  }, [error, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return null;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />

      <Route>
        <ProtectedRoute>
          <div className="min-h-screen bg-background flex">
            <Sidebar />
            <main className="flex-1 p-8 ml-64">
              <Switch>
                <Route path="/" component={EquipmentList} />
                <Route path="/equipment/add" component={AddEquipment} />
                <Route path="/equipment/:id" component={EquipmentDetails} />
                <Route path="/equipment/:id/edit" component={EditEquipment} />
                <Route path="/departments" component={DepartmentList} />
                <Route path="/maintenance" component={MaintenanceList} />
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;