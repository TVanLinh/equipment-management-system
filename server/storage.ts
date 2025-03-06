import { Department, Equipment, Maintenance, User, InsertDepartment, InsertEquipment, InsertMaintenance, InsertUser } from "@shared/schema";
import { query } from './db';

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

export class MySQLStorage implements IStorage {
  // Departments
  async getDepartments(): Promise<Department[]> {
    const departments = await query('SELECT * FROM departments');
    return departments as Department[];
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    const [department] = await query('SELECT * FROM departments WHERE id = ?', [id]);
    return department as Department | undefined;
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const result = await query(
      'INSERT INTO departments (name, code) VALUES (?, ?)',
      [department.name, department.code]
    );
    return { ...department, id: result.insertId };
  }

  // Equipment
  async getEquipment(): Promise<Equipment[]> {
    const equipment = await query('SELECT * FROM equipment');
    return equipment as Equipment[];
  }

  async getEquipmentById(id: number): Promise<Equipment | undefined> {
    const [equipment] = await query('SELECT * FROM equipment WHERE id = ?', [id]);
    return equipment as Equipment | undefined;
  }

  async createEquipment(equipment: InsertEquipment): Promise<Equipment> {
    const result = await query(
      `INSERT INTO equipment (
        equipmentId, equipmentName, equipmentType, model, serialNumber,
        countryOfOrigin, manufacturer, unitPrice, vat, fundingSource,
        supplier, status, purchaseDate, warrantyExpiry, departmentId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        equipment.equipmentId,
        equipment.equipmentName,
        equipment.equipmentType,
        equipment.model,
        equipment.serialNumber,
        equipment.countryOfOrigin,
        equipment.manufacturer,
        equipment.unitPrice,
        equipment.vat,
        equipment.fundingSource,
        equipment.supplier,
        equipment.status || 'Active',
        equipment.purchaseDate,
        equipment.warrantyExpiry,
        equipment.departmentId
      ]
    );
    return { ...equipment, id: result.insertId };
  }

  async updateEquipment(id: number, updates: Partial<InsertEquipment>): Promise<Equipment> {
    const setClause = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];

    await query(`UPDATE equipment SET ${setClause} WHERE id = ?`, values);
    const [updated] = await query('SELECT * FROM equipment WHERE id = ?', [id]);
    if (!updated) throw new Error("Equipment not found");
    return updated as Equipment;
  }

  // Maintenance
  async getMaintenance(): Promise<Maintenance[]> {
    const maintenance = await query('SELECT * FROM maintenance');
    return maintenance as Maintenance[];
  }

  async getMaintenanceByEquipment(equipmentId: number): Promise<Maintenance[]> {
    const maintenance = await query('SELECT * FROM maintenance WHERE equipmentId = ?', [equipmentId]);
    return maintenance as Maintenance[];
  }

  async createMaintenance(maintenance: InsertMaintenance): Promise<Maintenance> {
    const result = await query(
      `INSERT INTO maintenance (
        equipmentId, startDate, endDate, maintenanceType,
        status, performedBy, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        maintenance.equipmentId,
        maintenance.startDate,
        maintenance.endDate,
        maintenance.maintenanceType,
        maintenance.status || 'Scheduled',
        maintenance.performedBy,
        maintenance.notes
      ]
    );
    return { ...maintenance, id: result.insertId };
  }

  // Users
  async getUsers(): Promise<User[]> {
    const users = await query('SELECT * FROM users');
    return users as User[];
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await query('SELECT * FROM users WHERE id = ?', [id]);
    return user as User | undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await query('SELECT * FROM users WHERE username = ?', [username]);
    return user as User | undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await query(
      'INSERT INTO users (username, password, fullName, role, departmentId) VALUES (?, ?, ?, ?, ?)',
      [user.username, user.password, user.fullName, user.role || 'user', user.departmentId]
    );
    return { ...user, id: result.insertId };
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const setClause = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];

    await query(`UPDATE users SET ${setClause} WHERE id = ?`, values);
    const [updated] = await query('SELECT * FROM users WHERE id = ?', [id]);
    if (!updated) throw new Error("User not found");
    return updated as User;
  }
}

export const storage = new MySQLStorage();