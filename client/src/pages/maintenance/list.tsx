import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Maintenance } from "@shared/schema";

export default function MaintenanceList() {
  const { data: maintenance, isLoading } = useQuery<Maintenance[]>({
    queryKey: ["/api/maintenance"],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Maintenance History</h1>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipment ID</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Performed By</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {maintenance?.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.equipmentId}</TableCell>
                <TableCell>{new Date(record.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(record.endDate).toLocaleDateString()}</TableCell>
                <TableCell>{record.maintenanceType}</TableCell>
                <TableCell>{record.performedBy}</TableCell>
                <TableCell>{record.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
