import type { Express, Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertDepartmentSchema, insertEquipmentSchema, insertMaintenanceSchema, loginSchema, insertUserSchema, resetPasswordSchema } from "@shared/schema";
import multer from "multer";
import xlsx from "xlsx";
import session from 'express-session';
import { z } from "zod";
import { parse } from 'csv-parse'; // Assuming csv-parse is used

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
  // Add CORS middleware
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
  });

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
          // Parse numeric values
          const unitPrice = Number(row.unit_price || row.unitPrice || 0);
          const vat = Number(row.vat || 0);
          const departmentId = Number(row.department_id || row.departmentId || null);

          // Validate numeric values
          if (isNaN(unitPrice) || unitPrice < 0) {
            errors.push({
              row,
              error: "Invalid unit price",
            });
            continue;
          }

          if (isNaN(vat) || vat < 0 || vat > 100) {
            errors.push({
              row,
              error: "Invalid VAT percentage (must be between 0-100)",
            });
            continue;
          }

          if (departmentId && (isNaN(departmentId) || departmentId < 1)) {
            errors.push({
              row,
              error: "Invalid department ID",
            });
            continue;
          }

          const equipment = {
            equipmentId: String(row.equipment_id || row.equipmentId || '').trim(),
            equipmentName: String(row.equipment_name || row.equipmentName || '').trim(),
            equipmentType: String(row.equipment_type || row.equipmentType || '').trim(),
            model: String(row.model || '').trim(),
            serialNumber: String(row.serial_number || row.serialNumber || '').trim(),
            countryOfOrigin: String(row.country_of_origin || row.countryOfOrigin || '').trim(),
            manufacturer: String(row.manufacturer || '').trim(),
            unitPrice: String(unitPrice),
            vat: String(vat),
            fundingSource: String(row.funding_source || row.fundingSource || '').trim(),
            supplier: String(row.supplier || '').trim(),
            status: String(row.status || 'Active').trim(),
            purchaseDate: String(row.purchase_date || row.purchaseDate || new Date().toISOString().split('T')[0]).trim(),
            warrantyExpiry: String(row.warranty_expiry || row.warrantyExpiry || new Date().toISOString().split('T')[0]).trim(),
            departmentId: departmentId || null
          };

          // Validate required fields
          if (!equipment.equipmentId || !equipment.equipmentName || !equipment.equipmentType) {
            errors.push({
              row,
              error: "Missing required fields (equipmentId, equipmentName, equipmentType)",
            });
            continue;
          }

          const result = insertEquipmentSchema.safeParse(equipment);
          if (!result.success) {
            errors.push({
              row,
              errors: result.error.errors,
            });
            continue;
          }

          const savedEquipment = await storage.createEquipment(result.data);
          results.push(savedEquipment);
        } catch (error) {
          console.error('Error processing row:', row, error);
          errors.push({
            row,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return res.json({
        success: true,
        imported: results.length,
        total: data.length,
        failed: errors.length,
        errors: errors.length ? errors : undefined,
      });
    } catch (error) {
      console.error('Error importing equipment:', error);
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

    // Thêm validation và hướng dẫn
    const validationWs = xlsx.utils.aoa_to_sheet([
      ['Hướng dẫn nhập liệu:'],
      ['- username: Tên đăng nhập (bắt buộc)'],
      ['- password: Mật khẩu (bắt buộc)'],
      ['- fullName: Tên đầy đủ (bắt buộc)'],
      ['- role: Quyền (admin/manager/user), mặc định là user'],
      ['- departmentId: ID phòng ban (số)']
    ]);

    xlsx.utils.book_append_sheet(wb, ws, "Template");
    xlsx.utils.book_append_sheet(wb, validationWs, "Hướng dẫn");

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=user-template.xlsx');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.send(buffer);
  });

  app.post("/api/users/import", requireAuth, requireAdminOrManager, upload.single('file'), async (req: Request & { file?: Express.Multer.File }, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Chưa chọn file để import" });
      }

      let data;
      if (req.file.mimetype === "text/csv") {
        // Đọc file CSV với encoding UTF-8
        const csvContent = req.file.buffer.toString('utf-8');
        // Parse CSV thành JSON
        data = await new Promise((resolve, reject) => {
          parse(csvContent, {
            columns: true,
            skip_empty_lines: true
          }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
      } else {
        // Đọc file Excel
        const workbook = xlsx.read(req.file.buffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        data = xlsx.utils.sheet_to_json(worksheet);
      }

      console.log('Dữ liệu từ file:', data);

      const results = [];
      const errors = [];
      let rowNumber = 2; // Bắt đầu từ dòng 2 (sau header)

      // Lấy danh sách phòng ban để map code sang id
      const departments = await storage.getDepartments();

      for (const row of data as Record<string, unknown>[]) {
        try {
          console.log(`Đang xử lý dòng ${rowNumber}:`, row);

          // Xử lý các trường dữ liệu, hỗ trợ nhiều tên cột khác nhau
          const username = String(row.username || '').trim();
          const password = String(row.password || '').trim();
          const fullName = String(row.full_name || row.fullName || '').trim();
          const role = String(row.role || 'user').trim().toLowerCase();

          // Validate các trường bắt buộc
          if (!username || !password || !fullName) {
            errors.push({
              row: rowNumber,
              data: row,
              error: `Dòng ${rowNumber}: Username, password và tên đầy đủ không được để trống`
            });
            rowNumber++;
            continue;
          }

          // Validate role
          if (!['admin', 'manager', 'user'].includes(role)) {
            errors.push({
              row: rowNumber,
              data: row,
              error: `Dòng ${rowNumber}: Role không hợp lệ (phải là 'admin', 'manager' hoặc 'user')`
            });
            rowNumber++;
            continue;
          }

          // Kiểm tra username đã tồn tại
          const existingUser = await storage.getUserByUsername(username);
          if (existingUser) {
            errors.push({
              row: rowNumber,
              data: row,
              error: `Dòng ${rowNumber}: Username "${username}" đã tồn tại`
            });
            rowNumber++;
            continue;
          }

          // Xử lý department ID
          let departmentId = null;
          const deptCode = String(row.department_id || row.departmentId || '').trim();
          if (deptCode) {
            // Tìm department theo mã
            const department = departments.find(d => d.code === deptCode);
            if (!department) {
              errors.push({
                row: rowNumber,
                data: row,
                error: `Dòng ${rowNumber}: Không tìm thấy phòng ban với mã "${deptCode}"`
              });
              rowNumber++;
              continue;
            }
            departmentId = department.id;
          }

          const userData = {
            username,
            password,
            fullName,
            role,
            departmentId
          };

          console.log(`Dữ liệu người dùng đã chuyển đổi dòng ${rowNumber}:`, userData);

          const result = insertUserSchema.safeParse(userData);
          if (!result.success) {
            errors.push({
              row: rowNumber,
              data: row,
              error: `Dòng ${rowNumber}: ${result.error.errors.map(e => e.message).join(', ')}`
            });
            rowNumber++;
            continue;
          }

          const savedUser = await storage.createUser(result.data);
          results.push({
            row: rowNumber,
            user: savedUser
          });

        } catch (error) {
          console.error(`Lỗi xử lý dòng ${rowNumber}:`, error);
          errors.push({
            row: rowNumber,
            data: row,
            error: error instanceof Error ? error.message : "Lỗi không xác định"
          });
        }
        rowNumber++;
      }

      console.log('Kết quả import:', {
        total: data.length,
        imported: results.length,
        errors: errors
      });

      if (errors.length > 0) {
        return res.json({
          success: true,
          imported: results.length,
          failed: errors.length,
          total: data.length,
          errors: errors
        });
      }

      res.json({
        success: true,
        imported: results.length,
        total: data.length
      });

    } catch (error) {
      console.error('Lỗi import user:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : "Lỗi xử lý file",
        details: error
      });
    }
  });

  // Thêm route cho user template CSV
  app.get("/user-template.csv", requireAuth, requireAdminOrManager, (_req, res) => {
    const headers = [
      "username",
      "password",
      "fullName",
      "role",
      "departmentId"
    ].join(",");

    const sampleData = [
      "user123",
      "password123",
      "Nguyễn Văn A",
      "user",
      "1"
    ].join(",");

    const csvContent = `${headers}\n${sampleData}`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=user-template.csv');
    res.send(csvContent);
  });

  return createServer(app);
}