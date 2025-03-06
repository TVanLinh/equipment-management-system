-- Create Departments table
CREATE TABLE departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE
);

-- Create Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  fullName VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'user') DEFAULT 'user',
  departmentId INT,
  FOREIGN KEY (departmentId) REFERENCES departments(id)
);

-- Create Equipment table
CREATE TABLE equipment (
  id INT PRIMARY KEY AUTO_INCREMENT,
  equipmentId VARCHAR(50) NOT NULL UNIQUE,
  equipmentName VARCHAR(255) NOT NULL,
  equipmentType VARCHAR(100) NOT NULL,
  model VARCHAR(100),
  serialNumber VARCHAR(100),
  countryOfOrigin VARCHAR(100),
  manufacturer VARCHAR(100),
  unitPrice DECIMAL(15,2) NOT NULL,
  vat DECIMAL(5,2),
  fundingSource VARCHAR(100),
  supplier VARCHAR(100),
  status ENUM('Active', 'Maintenance', 'Inactive', 'PendingMaintenance') DEFAULT 'Active',
  purchaseDate DATE,
  warrantyExpiry DATE,
  departmentId INT,
  FOREIGN KEY (departmentId) REFERENCES departments(id)
);

-- Create Maintenance table
CREATE TABLE maintenance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  equipmentId INT NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  maintenanceType VARCHAR(50) NOT NULL,
  status ENUM('Completed', 'In Progress', 'Scheduled') DEFAULT 'Scheduled',
  performedBy VARCHAR(100),
  notes TEXT,
  FOREIGN KEY (equipmentId) REFERENCES equipment(id)
);
