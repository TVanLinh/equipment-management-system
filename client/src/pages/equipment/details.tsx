import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Equipment } from "@shared/schema";

export default function EquipmentDetails() {
  const { id } = useParams();
  
  const { data: equipment, isLoading } = useQuery<Equipment>({
    queryKey: [`/api/equipment/${id}`],
  });

  if (isLoading) return <div>Loading...</div>;
  if (!equipment) return <div>Equipment not found</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Equipment Details</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">Equipment ID</dt>
                <dd>{equipment.equipmentId}</dd>
              </div>
              <div>
                <dt className="font-medium">Name</dt>
                <dd>{equipment.equipmentName}</dd>
              </div>
              <div>
                <dt className="font-medium">Type</dt>
                <dd>{equipment.equipmentType}</dd>
              </div>
              <div>
                <dt className="font-medium">Model</dt>
                <dd>{equipment.model}</dd>
              </div>
              <div>
                <dt className="font-medium">Serial Number</dt>
                <dd>{equipment.serialNumber}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manufacturing Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">Manufacturer</dt>
                <dd>{equipment.manufacturer}</dd>
              </div>
              <div>
                <dt className="font-medium">Country of Origin</dt>
                <dd>{equipment.countryOfOrigin}</dd>
              </div>
              <div>
                <dt className="font-medium">Supplier</dt>
                <dd>{equipment.supplier}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">Unit Price</dt>
                <dd>{equipment.unitPrice}</dd>
              </div>
              <div>
                <dt className="font-medium">VAT</dt>
                <dd>{equipment.vat}%</dd>
              </div>
              <div>
                <dt className="font-medium">Funding Source</dt>
                <dd>{equipment.fundingSource}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status & Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">Status</dt>
                <dd>{equipment.status}</dd>
              </div>
              <div>
                <dt className="font-medium">Purchase Date</dt>
                <dd>{new Date(equipment.purchaseDate).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="font-medium">Warranty Expiry</dt>
                <dd>{new Date(equipment.warrantyExpiry).toLocaleDateString()}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
