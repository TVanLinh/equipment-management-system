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
import { useState } from "react";
import { cn } from "@/lib/utils";

function Router() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar onCollapse={setIsSidebarCollapsed} />
      <main className={cn(
        "flex-1 p-8 transition-all duration-300",
        isSidebarCollapsed ? "ml-20" : "ml-64"
      )}>
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