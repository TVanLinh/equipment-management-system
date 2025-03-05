import { Department, Equipment, Maintenance, InsertDepartment, InsertEquipment, InsertMaintenance } from "@shared/schema";

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