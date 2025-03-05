import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertDepartmentSchema, insertEquipmentSchema, insertMaintenanceSchema } from "@shared/schema";
import multer from "multer";
import xlsx from "xlsx";
import { z } from "zod";

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
        file.mimetype === "text/csv") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Please upload an Excel (.xlsx) or CSV file."));
    }
  }
});

export async function registerRoutes(app: Express) {
  // Departments
  app.get("/api/departments", async (_req, res) => {
    const departments = await storage.getDepartments();
    res.json(departments);
  });

  app.post("/api/departments", async (req, res) => {
    const result = insertDepartmentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const department = await storage.createDepartment(result.data);
    res.json(department);
  });

  // Equipment
  app.get("/api/equipment", async (_req, res) => {
    const equipment = await storage.getEquipment();
    res.json(equipment);
  });

  app.get("/api/equipment/:id", async (req, res) => {
    const equipment = await storage.getEquipmentById(Number(req.params.id));
    if (!equipment) {
      return res.status(404).json({ error: "Equipment not found" });
    }
    res.json(equipment);
  });

  app.post("/api/equipment", async (req, res) => {
    const result = insertEquipmentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const equipment = await storage.createEquipment(result.data);
    res.json(equipment);
  });

  app.patch("/api/equipment/:id", async (req, res) => {
    const result = insertEquipmentSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    try {
      const equipment = await storage.updateEquipment(Number(req.params.id), result.data);
      res.json(equipment);
    } catch (error) {
      res.status(404).json({ error: "Equipment not found" });
    }
  });

  // Import Equipment from Excel/CSV
  app.post("/api/equipment/import", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const workbook = xlsx.read(req.file.buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(worksheet);

      const results = [];
      const errors = [];

      for (const row of data) {
        try {
          const equipment = {
            equipmentId: row.equipment_id || row.equipmentId,
            equipmentName: row.equipment_name || row.equipmentName,
            equipmentType: row.equipment_type || row.equipmentType,
            model: row.model,
            serialNumber: row.serial_number || row.serialNumber,
            countryOfOrigin: row.country_of_origin || row.countryOfOrigin,
            manufacturer: row.manufacturer,
            unitPrice: row.unit_price || row.unitPrice,
            vat: row.vat,
            fundingSource: row.funding_source || row.fundingSource,
            supplier: row.supplier,
            status: row.status || "Active",
            purchaseDate: row.purchase_date || row.purchaseDate,
            warrantyExpiry: row.warranty_expiry || row.warrantyExpiry,
            departmentId: row.department_id || row.departmentId,
          };

          const result = insertEquipmentSchema.safeParse(equipment);
          if (!result.success) {
            errors.push({
              row: equipment,
              errors: result.error.errors,
            });
            continue;
          }

          const savedEquipment = await storage.createEquipment(result.data);
          results.push(savedEquipment);
        } catch (error) {
          errors.push({
            row,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      res.json({
        success: true,
        imported: results.length,
        errors: errors.length ? errors : undefined,
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to process file",
      });
    }
  });

  // Maintenance
  app.get("/api/maintenance", async (_req, res) => {
    const maintenance = await storage.getMaintenance();
    res.json(maintenance);
  });

  app.get("/api/equipment/:id/maintenance", async (req, res) => {
    const maintenance = await storage.getMaintenanceByEquipment(Number(req.params.id));
    res.json(maintenance);
  });

  app.post("/api/maintenance", async (req, res) => {
    const result = insertMaintenanceSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const maintenance = await storage.createMaintenance(result.data);
    res.json(maintenance);
  });

  // Download template
  app.get("/template.xlsx", (_req, res) => {
    const template = [
      {
        equipment_id: "MD001",
        equipment_name: "Máy X-Ray DR-3000",
        equipment_type: "Chẩn đoán hình ảnh",
        model: "DR-3000",
        serial_number: "XR2023001",
        country_of_origin: "Japan",
        manufacturer: "Toshiba",
        unit_price: "150000000",
        vat: "10",
        funding_source: "Ngân sách nhà nước",
        supplier: "Công ty ABC",
        status: "Active",
        purchase_date: "2023-01-01",
        warranty_expiry: "2025-01-01",
        department_id: "1"
      }
    ];

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(template);
    xlsx.utils.book_append_sheet(wb, ws, "Template");

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=template.xlsx');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.send(buffer);
  });

  // After the existing template.xlsx endpoint, add CSV template endpoint
  app.get("/template.csv", (_req, res) => {
    const headers = [
      "equipment_id",
      "equipment_name", 
      "equipment_type",
      "model",
      "serial_number",
      "country_of_origin",
      "manufacturer",
      "unit_price",
      "vat",
      "funding_source",
      "supplier",
      "status",
      "purchase_date",
      "warranty_expiry",
      "department_id"
    ].join(",");

    const sampleData = [
      "MD001",
      "Máy X-Ray DR-3000",
      "Chẩn đoán hình ảnh",
      "DR-3000",
      "XR2023001",
      "Japan",
      "Toshiba",
      "150000000",
      "10",
      "Ngân sách nhà nước",
      "Công ty ABC",
      "Active",
      "2023-01-01",
      "2025-01-01",
      "1"
    ].join(",");

    const csvContent = `${headers}\n${sampleData}`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=template.csv');
    res.send(csvContent);
  });

  return createServer(app);
}