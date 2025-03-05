import { Department, Equipment, Maintenance, InsertDepartment, InsertEquipment, InsertMaintenance } from "@shared/schema";
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export interface IStorage {
  // Departments
  getDepartments(): Promise<Department[]>;
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;

  // Equipment
  getEquipment(): Promise<Equipment[]>;
  getEquipmentById(id: number): Promise<Equipment | undefined>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: number, equipment: Partial<InsertEquipment>): Promise<Equipment>;

  // Maintenance
  getMaintenance(): Promise<Maintenance[]>;
  getMaintenanceByEquipment(equipmentId: number): Promise<Maintenance[]>;
  createMaintenance(maintenance: InsertMaintenance): Promise<Maintenance>;
}

export class MemStorage implements IStorage {
  private departments: Map<number, Department>;
  private equipment: Map<number, Equipment>;
  private maintenance: Map<number, Maintenance>;
  private departmentId: number = 1;
  private equipmentId: number = 1;
  private maintenanceId: number = 1;

  constructor() {
    this.departments = new Map();
    this.equipment = new Map();
    this.maintenance = new Map();

    // Khởi tạo dữ liệu mẫu
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Đọc dữ liệu phòng ban từ file CSV
    const csvPath = path.join(process.cwd(), 'attached_assets', 'Copy of danhsach_khoa - danhsach_khoa.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });

    // Import các phòng ban từ CSV
    records.forEach((record: any) => {
      const department: InsertDepartment = {
        name: record.ORG_NAME,
        code: record.Department_CODE,
      };
      this.createDepartment(department);
    });

    // Danh sách loại thiết bị mẫu
    const equipmentTypes = [
      "Chẩn đoán hình ảnh",
      "Phẫu thuật",
      "Xét nghiệm",
      "Theo dõi bệnh nhân",
      "Hồi sức cấp cứu",
      "Khám bệnh",
      "Phục hồi chức năng"
    ];

    // Danh sách nhà sản xuất mẫu
    const manufacturers = [
      "Siemens", "Phillips", "GE Healthcare", "Toshiba", "Samsung Medison",
      "Mindray", "Hitachi", "Canon Medical", "Fujifilm", "Olympus"
    ];

    // Tạo 50 thiết bị mẫu
    for (let i = 1; i <= 50; i++) {
      const purchaseDate = new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28));
      const warrantyYears = Math.floor(Math.random() * 3) + 2;
      const warrantyExpiry = new Date(purchaseDate);
      warrantyExpiry.setFullYear(warrantyExpiry.getFullYear() + warrantyYears);

      const equipment: InsertEquipment = {
        equipmentId: `MD${String(i).padStart(3, '0')}`,
        equipmentName: `Thiết bị ${equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)]} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 1000)}`,
        equipmentType: equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)],
        model: `Model-${Math.floor(Math.random() * 9000) + 1000}`,
        serialNumber: `SN${Math.floor(Math.random() * 90000) + 10000}`,
        countryOfOrigin: ["Đức", "Nhật Bản", "Hàn Quốc", "Mỹ", "Trung Quốc"][Math.floor(Math.random() * 5)],
        manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
        unitPrice: String(Math.floor(Math.random() * 900000000) + 100000000),
        vat: String(Math.floor(Math.random() * 3) * 5 + 5), // 5%, 10%, or 15%
        fundingSource: ["Ngân sách nhà nước", "Viện trợ", "Vốn vay"][Math.floor(Math.random() * 3)],
        supplier: ["Công ty ABC", "Công ty XYZ", "Công ty Medical", "Công ty Healthcare"][Math.floor(Math.random() * 4)],
        status: ["Active", "Maintenance", "Inactive"][Math.floor(Math.random() * 3)],
        purchaseDate: purchaseDate.toISOString().split('T')[0],
        warrantyExpiry: warrantyExpiry.toISOString().split('T')[0],
        departmentId: Math.floor(Math.random() * records.length) + 1
      };

      this.createEquipment(equipment);
    }
  }

  async getDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    return this.departments.get(id);
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const id = this.departmentId++;
    const newDepartment = { ...department, id };
    this.departments.set(id, newDepartment);
    return newDepartment;
  }

  async getEquipment(): Promise<Equipment[]> {
    return Array.from(this.equipment.values());
  }

  async getEquipmentById(id: number): Promise<Equipment | undefined> {
    return this.equipment.get(id);
  }

  async createEquipment(equipment: InsertEquipment): Promise<Equipment> {
    const id = this.equipmentId++;
    const newEquipment = {
      ...equipment,
      id,
      unitPrice: equipment.unitPrice.toString(),
      vat: equipment.vat.toString(),
      departmentId: equipment.departmentId || null
    };
    this.equipment.set(id, newEquipment);
    return newEquipment;
  }

  async updateEquipment(id: number, updates: Partial<InsertEquipment>): Promise<Equipment> {
    const existing = this.equipment.get(id);
    if (!existing) throw new Error("Equipment not found");

    const updated = { ...existing, ...updates };
    this.equipment.set(id, updated);
    return updated;
  }

  async getMaintenance(): Promise<Maintenance[]> {
    return Array.from(this.maintenance.values());
  }

  async getMaintenanceByEquipment(equipmentId: number): Promise<Maintenance[]> {
    return Array.from(this.maintenance.values()).filter(m => m.equipmentId === equipmentId);
  }

  async createMaintenance(maintenance: InsertMaintenance): Promise<Maintenance> {
    const id = this.maintenanceId++;
    const newMaintenance = { ...maintenance, id };
    this.maintenance.set(id, newMaintenance);
    return newMaintenance;
  }
}

export const storage = new MemStorage();