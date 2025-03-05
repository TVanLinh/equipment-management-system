import { pgTable, text, serial, integer, date, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  departmentId: integer("department_id").references(() => departments.id),
  role: text("role").notNull(), // 'admin' | 'manager' | 'user'
});

export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  equipmentId: text("equipment_id").notNull().unique(),
  equipmentName: text("equipment_name").notNull(),
  equipmentType: text("equipment_type").notNull(),
  model: text("model").notNull(),
  serialNumber: text("serial_number").notNull(),
  countryOfOrigin: text("country_of_origin").notNull(),
  manufacturer: text("manufacturer").notNull(),
  unitPrice: numeric("unit_price").notNull(),
  vat: numeric("vat").notNull(),
  fundingSource: text("funding_source").notNull(),
  supplier: text("supplier").notNull(),
  status: text("status").notNull(),
  purchaseDate: date("purchase_date").notNull(),
  warrantyExpiry: date("warranty_expiry").notNull(),
  departmentId: integer("department_id").references(() => departments.id),
});

export const maintenance = pgTable("maintenance", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").references(() => equipment.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  maintenanceType: text("maintenance_type").notNull(),
  performedBy: text("performed_by").notNull(),
  notes: text("notes"),
});

export const insertDepartmentSchema = createInsertSchema(departments);
export const insertEquipmentSchema = createInsertSchema(equipment);
export const insertMaintenanceSchema = createInsertSchema(maintenance);

// User schemas
export const insertUserSchema = createInsertSchema(users).extend({
  role: z.enum(['admin', 'manager', 'user']),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Types
export type Department = typeof departments.$inferSelect;
export type Equipment = typeof equipment.$inferSelect;
export type Maintenance = typeof maintenance.$inferSelect;
export type User = typeof users.$inferSelect;

export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type InsertMaintenance = z.infer<typeof insertMaintenanceSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;