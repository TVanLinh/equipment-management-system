import { Department, Equipment, Maintenance, User, InsertDepartment, InsertEquipment, InsertMaintenance, InsertUser } from "@shared/schema";
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

  // Users
  getUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
}

export class MemStorage implements IStorage {
  private departments: Map<number, Department>;
  private equipment: Map<number, Equipment>;
  private maintenance: Map<number, Maintenance>;
  private users: Map<number, User>;
  private departmentId: number = 1;
  private equipmentId: number = 1;
  private maintenanceId: number = 1;
  private userId: number = 1;

  constructor() {
    this.departments = new Map();
    this.equipment = new Map();
    this.maintenance = new Map();
    this.users = new Map();

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

    // Tìm ID của Phòng Vật Tư và Ban giám đốc
    const vtttbDept = Array.from(this.departments.values()).find(d => d.code === 'VTTTB');
    const bgdDept = Array.from(this.departments.values()).find(d => d.code === 'BGĐ');

    if (vtttbDept) {
      // Admin user cho Phòng Vật Tư
      this.createUser({
        username: 'admin',
        password: 'admin123',
        fullName: 'Administrator',
        departmentId: vtttbDept.id,
        role: 'admin'
      });
    }

    if (bgdDept) {
      // Manager user cho Ban giám đốc
      this.createUser({
        username: 'manager',
        password: 'manager123',
        fullName: 'Manager',
        departmentId: bgdDept.id,
        role: 'manager'
      });
    }

    // Tạo user cho các khoa còn lại
    Array.from(this.departments.values())
      .filter(d => d.id !== vtttbDept?.id && d.id !== bgdDept?.id)
      .forEach(dept => {
        this.createUser({
          username: dept.code.toLowerCase(),
          password: 'user123',
          fullName: dept.name,
          departmentId: dept.id,
          role: 'user'
        });
      });
  }

  // Department methods
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

  // Equipment methods
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

  // Maintenance methods
  async getMaintenance(): Promise<Maintenance[]> {
    return Array.from(this.maintenance.values());
  }

  async getMaintenanceByEquipment(equipmentId: number): Promise<Maintenance[]> {
    return Array.from(this.maintenance.values()).filter(m => m.equipmentId === equipmentId);
  }

  async createMaintenance(maintenance: InsertMaintenance): Promise<Maintenance> {
    const id = this.maintenanceId++;
    const newMaintenance = {
      ...maintenance,
      id,
      equipmentId: maintenance.equipmentId || null,
      notes: maintenance.notes || null
    };
    this.maintenance.set(id, newMaintenance);
    return newMaintenance;
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser = {
      ...user,
      id,
      departmentId: user.departmentId || null
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const existing = this.users.get(id);
    if (!existing) throw new Error("User not found");

    const updated = { ...existing, ...updates };
    this.users.set(id, updated);
    return updated;
  }
}

// MySQL Storage implementation (for future use)
export class MySQLStorage implements IStorage {
  // Implementation methods will be added when switching to MySQL
  async getDepartments(): Promise<Department[]> { throw new Error("Not implemented"); }
  async getDepartment(id: number): Promise<Department | undefined> { throw new Error("Not implemented"); }
  async createDepartment(department: InsertDepartment): Promise<Department> { throw new Error("Not implemented"); }
  async getEquipment(): Promise<Equipment[]> { throw new Error("Not implemented"); }
  async getEquipmentById(id: number): Promise<Equipment | undefined> { throw new Error("Not implemented"); }
  async createEquipment(equipment: InsertEquipment): Promise<Equipment> { throw new Error("Not implemented"); }
  async updateEquipment(id: number, equipment: Partial<InsertEquipment>): Promise<Equipment> { throw new Error("Not implemented"); }
  async getMaintenance(): Promise<Maintenance[]> { throw new Error("Not implemented"); }
  async getMaintenanceByEquipment(equipmentId: number): Promise<Maintenance[]> { throw new Error("Not implemented"); }
  async createMaintenance(maintenance: InsertMaintenance): Promise<Maintenance> { throw new Error("Not implemented"); }
  async getUsers(): Promise<User[]> { throw new Error("Not implemented"); }
  async getUserById(id: number): Promise<User | undefined> { throw new Error("Not implemented"); }
  async getUserByUsername(username: string): Promise<User | undefined> { throw new Error("Not implemented"); }
  async createUser(user: InsertUser): Promise<User> { throw new Error("Not implemented"); }
  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> { throw new Error("Not implemented"); }
}

export const storage = new MemStorage();