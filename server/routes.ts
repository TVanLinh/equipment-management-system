import type { Express, Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertDepartmentSchema, insertEquipmentSchema, insertMaintenanceSchema, loginSchema } from "@shared/schema";
import multer from "multer";
import xlsx from "xlsx";
import session from 'express-session';
import { z } from "zod";

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
        file.mimetype === "text/csv") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Please upload an Excel (.xlsx) or CSV file."));
    }
  }
});

// Middleware để kiểm tra xem người dùng đã đăng nhập chưa
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// Middleware để kiểm tra quyền admin/manager
const requireAdminOrManager = async (req: Request, res: Response, next: NextFunction) => {
  const user = await storage.getUserById(req.session.userId!);
  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};

export async function registerRoutes(app: Express) {
  // Cấu hình session
  app.use(
    session({
      secret: 'your-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    })
  );

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const user = await storage.getUserByUsername(result.data.username);
    if (!user || user.password !== result.data.password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.userId = user.id;
    res.json({ 
      id: user.id,
      username: user.username,
      role: user.role,
      departmentId: user.departmentId
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    const user = await storage.getUserById(req.session.userId!);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      departmentId: user.departmentId
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // Departments
  app.get("/api/departments", requireAuth, async (_req, res) => {
    const departments = await storage.getDepartments();
    res.json(departments);
  });

  // Equipment
  app.get("/api/equipment", requireAuth, async (req, res) => {
    const user = await storage.getUserById(req.session.userId!);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    let equipment = await storage.getEquipment();

    // Nếu là user thường, chỉ trả về thiết bị thuộc khoa của họ
    if (user.role === 'user') {
      equipment = equipment.filter(e => e.departmentId === user.departmentId);
    }

    res.json(equipment);
  });

  app.get("/api/equipment/:id", requireAuth, async (req, res) => {
    const equipment = await storage.getEquipmentById(Number(req.params.id));
    if (!equipment) {
      return res.status(404).json({ error: "Equipment not found" });
    }

    const user = await storage.getUserById(req.session.userId!);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // Nếu là user thường và thiết bị không thuộc khoa của họ
    if (user.role === 'user' && equipment.departmentId !== user.departmentId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(equipment);
  });

  app.post("/api/equipment", requireAuth, requireAdminOrManager, async (req, res) => {
    const result = insertEquipmentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const equipment = await storage.createEquipment(result.data);
    res.json(equipment);
  });

  app.patch("/api/equipment/:id", requireAuth, requireAdminOrManager, async (req, res) => {
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

  // Import Equipment
  app.post("/api/equipment/import", requireAuth, requireAdminOrManager, upload.single('file'), async (req: Request & { file?: Express.Multer.File }, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const workbook = xlsx.read(req.file.buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(worksheet);

      const results = [];
      const errors = [];

      for (const row of data as Record<string, unknown>[]) {
        try {
          const equipment = {
            equipmentId: String(row.equipment_id || row.equipmentId || ''),
            equipmentName: String(row.equipment_name || row.equipmentName || ''),
            equipmentType: String(row.equipment_type || row.equipmentType || ''),
            model: String(row.model || ''),
            serialNumber: String(row.serial_number || row.serialNumber || ''),
            countryOfOrigin: String(row.country_of_origin || row.countryOfOrigin || ''),
            manufacturer: String(row.manufacturer || ''),
            unitPrice: String(row.unit_price || row.unitPrice || '0'),
            vat: String(row.vat || '0'),
            fundingSource: String(row.funding_source || row.fundingSource || ''),
            supplier: String(row.supplier || ''),
            status: String(row.status || 'Active'),
            purchaseDate: String(row.purchase_date || row.purchaseDate || new Date().toISOString().split('T')[0]),
            warrantyExpiry: String(row.warranty_expiry || row.warrantyExpiry || new Date().toISOString().split('T')[0]),
            departmentId: Number(row.department_id || row.departmentId || null)
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
  app.get("/api/maintenance", requireAuth, async (_req, res) => {
    const maintenance = await storage.getMaintenance();
    res.json(maintenance);
  });

  app.get("/api/equipment/:id/maintenance", requireAuth, async (req, res) => {
    const maintenance = await storage.getMaintenanceByEquipment(Number(req.params.id));
    res.json(maintenance);
  });

  app.post("/api/maintenance", requireAuth, async (req, res) => {
    const result = insertMaintenanceSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const maintenance = await storage.createMaintenance(result.data);
    res.json(maintenance);
  });

  // Template download routes
  app.get("/template.xlsx", requireAuth, (_req, res) => {
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

  app.get("/template.csv", requireAuth, (_req, res) => {
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