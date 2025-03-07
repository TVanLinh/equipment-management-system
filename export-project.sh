
#!/bin/bash

# Create exports directory if it doesn't exist
mkdir -p exports

# Export database data
echo "Exporting database data..."
npx tsx server/export-data.ts

# Create a tar archive of the entire project
echo "Creating project archive..."
tar --exclude="node_modules" --exclude="exports" --exclude=".git" -czf exports/equipment_master_project.tar.gz .

echo "Project exported successfully to exports/equipment_master_project.tar.gz"
echo "Database data exported to exports/equipment_master_data.json"
