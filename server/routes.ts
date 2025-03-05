import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertDepartmentSchema, insertEquipmentSchema, insertMaintenanceSchema } from "@shared/schema";

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

  return createServer(app);
}
