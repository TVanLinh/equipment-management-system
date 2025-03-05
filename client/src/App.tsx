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

function Router() {
  return (
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