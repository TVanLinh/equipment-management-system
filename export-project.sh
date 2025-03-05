
#!/bin/bash

# Create exports directory if it doesn't exist
mkdir -p exports

# Export database data
echo "Exporting database data..."
npx tsx server/export-data.ts

# Create a zip file of the entire project
echo "Creating project archive..."
zip -r exports/equipment_master_project.zip . -x "node_modules/*" "exports/*" ".git/*"

echo "Project exported successfully to exports/equipment_master_project.zip"
echo "Database data exported to exports/equipment_master_data.json"
