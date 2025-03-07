
import fs from 'fs';
import path from 'path';
import { storage } from './storage';

async function exportData() {
  try {
    // Create exports directory if it doesn't exist
    const exportDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    // Get all data from storage
    const departments = await storage.getDepartments();
    const equipment = await storage.getEquipment();
    const maintenance = await storage.getMaintenance();
    const users = await storage.getUsers();

    // Create data object
    const data = {
      departments,
      equipment,
      maintenance,
      users: users.map(user => ({
        ...user,
        // Mask passwords in export for security
        password: "***MASKED***"
      }))
    };

    // Write to JSON file
    fs.writeFileSync(
      path.join(exportDir, 'equipment_master_data.json'),
      JSON.stringify(data, null, 2)
    );

    console.log('Data exported successfully to exports/equipment_master_data.json');
  } catch (error) {
    console.error('Failed to export data:', error);
  }
}

exportData();
