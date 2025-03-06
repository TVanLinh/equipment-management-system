import type { Express, Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertDepartmentSchema, insertEquipmentSchema, insertMaintenanceSchema, loginSchema, insertUserSchema, resetPasswordSchema } from "@shared/schema";
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
  // Cấu hình session trước khi đăng ký routes
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
    try {
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
        fullName: user.fullName,
        departmentId: user.departmentId
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUserById(req.session.userId!);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        departmentId: user.departmentId
      });
    } catch (error) {
      console.error('Auth check error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
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
    try {
      // Kiểm tra thiết bị có tồn tại không
      const equipment = await storage.getEquipmentById(Number(req.params.id));
      if (!equipment) {
        return res.status(404).json({ error: "Không tìm thấy thiết bị" });
      }

      // Kiểm tra quyền truy cập
      const user = await storage.getUserById(req.session.userId!);
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      // Nếu là user thường và thiết bị không thuộc khoa của họ
      if (user.role === 'user' && equipment.departmentId !== user.departmentId) {
        return res.status(403).json({ error: "Bạn không có quyền xem thiết bị này" });
      }

      res.json(equipment);
    } catch (error) {
      console.error('Error getting equipment:', error);
      res.status(500).json({ error: "Internal server error" });
    }
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
            equipmentId: String(row.equipment_id || row.equipmentId || '').trim(),
            equipmentName: String(row.equipment_name || row.equipmentName || '').trim(),
            equipmentType: String(row.equipment_type || row.equipmentType || '').trim(),
            model: String(row.model || '').trim(),
            serialNumber: String(row.serial_number || row.serialNumber || '').trim(),
            countryOfOrigin: String(row.country_of_origin || row.countryOfOrigin || '').trim(),
            manufacturer: String(row.manufacturer || '').trim(),
            unitPrice: Number(row.unit_price || row.unitPrice || 0),
            vat: Number(row.vat || 0),
            fundingSource: String(row.funding_source || row.fundingSource || '').trim(),
            supplier: String(row.supplier || '').trim(),
            status: String(row.status || 'Active').trim(),
            purchaseDate: String(row.purchase_date || row.purchaseDate || new Date().toISOString().split('T')[0]).trim(),
            warrantyExpiry: String(row.warranty_expiry || row.warrantyExpiry || new Date().toISOString().split('T')[0]).trim(),
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

  // Update maintenance request handling
  app.post("/api/maintenance", requireAuth, async (req, res) => {
    try {
      const result = insertMaintenanceSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      // Cập nhật trạng thái thiết bị thành "PendingMaintenance"
      await storage.updateEquipment(result.data.equipmentId, {
        status: "PendingMaintenance"
      });

      // Tạo yêu cầu bảo trì
      const maintenance = await storage.createMaintenance(result.data);
      res.json(maintenance);
    } catch (error) {
      console.error('Maintenance creation error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Template download routes
  app.get("/template.xlsx", requireAuth, (_req, res) => {
    const template = [
      {
        equipmentId: "MD001",
        equipmentName: "Máy X-Ray DR-3000",
        equipmentType: "Chẩn đoán hình ảnh",
        model: "DR-3000",
        serialNumber: "XR2023001",
        countryOfOrigin: "Japan",
        manufacturer: "Toshiba",
        unitPrice: "150000000",
        vat: "10",
        fundingSource: "Ngân sách nhà nước",
        supplier: "Công ty ABC",
        status: "Active",
        purchaseDate: "2023-01-01",
        warrantyExpiry: "2025-01-01",
        departmentId: 1
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
      "equipmentId",
      "equipmentName",
      "equipmentType",
      "model",
      "serialNumber",
      "countryOfOrigin",
      "manufacturer",
      "unitPrice",
      "vat",
      "fundingSource",
      "supplier",
      "status",
      "purchaseDate",
      "warrantyExpiry",
      "departmentId"
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

  // Get all users (admin only)
  app.get("/api/users", requireAuth, requireAdminOrManager, async (_req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  // Create new user (admin only)
  app.post("/api/users", requireAuth, requireAdminOrManager, async (req, res) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const user = await storage.createUser(result.data);
    res.json(user);
  });

  // Reset password (admin only)
  app.post("/api/users/:id/reset-password", requireAuth, requireAdminOrManager, async (req, res) => {
    const result = resetPasswordSchema.safeParse({
      id: Number(req.params.id),
      newPassword: req.body.newPassword
    });
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    try {
      const user = await storage.getUserById(result.data.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const updatedUser = await storage.updateUser(result.data.id, {
        password: result.data.newPassword
      });
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // Thêm route mới cho user template và import
  app.get("/user-template.xlsx", requireAuth, requireAdminOrManager, (_req, res) => {
    const template = [
      {
        username: "user123",
        password: "password123",
        fullName: "Nguyễn Văn A",
        role: "user",
        departmentId: 1
      }
    ];

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(template);
    xlsx.utils.book_append_sheet(wb, ws, "Template");

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=user-template.xlsx');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.send(buffer);
  });

  app.post("/api/users/import", requireAuth, requireAdminOrManager, upload.single('file'), async (req: Request & { file?: Express.Multer.File }, res) => {
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
          // Convert departmentId safely
          let departmentId = null;
          if (row.departmentId !== undefined && row.departmentId !== null) {
            const deptId = Number(row.departmentId);
            if (!isNaN(deptId)) {
              departmentId = deptId;
            }
          }

          const user = {
            username: String(row.username || '').trim(),
            password: String(row.password || '').trim(),
            fullName: String(row.fullName || '').trim(),
            role: String(row.role || 'user').trim(),
            departmentId: departmentId
          };

          // Validate required fields
          if (!user.username || !user.password || !user.fullName) {
            errors.push({
              row: user,
              error: "Username, password và tên đầy đủ không được để trống",
            });
            continue;
          }

          // Validate role
          if (!['admin', 'manager', 'user'].includes(user.role)) {
            errors.push({
              row: user,
              error: "Role không hợp lệ (phải là 'admin', 'manager' hoặc 'user')",
            });
            continue;
          }

          const result = insertUserSchema.safeParse(user);
          if (!result.success) {
            errors.push({
              row: user,
              errors: result.error.errors,
            });
            continue;
          }

          // Kiểm tra username đã tồn tại chưa
          const existingUser = await storage.getUserByUsername(user.username);
          if (existingUser) {
            errors.push({
              row: user,
              error: "Username đã tồn tại",
            });
            continue;
          }

          // Kiểm tra department tồn tại
          if (user.departmentId !== null) {
            const department = await storage.getDepartment(user.departmentId);
            if (!department) {
              errors.push({
                row: user,
                error: `Phòng ban với ID ${user.departmentId} không tồn tại`,
              });
              continue;
            }
          }

          const savedUser = await storage.createUser(result.data);
          results.push(savedUser);
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
      console.error('Import users error:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to process file",
      });
    }
  });

  return createServer(app);
}