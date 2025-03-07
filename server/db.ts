
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Sử dụng trực tiếp giá trị IP thay vì đọc từ biến môi trường
const pool = mysql.createPool({
  host: '34.133.56.193',
  user: 'sondn',
  password: 'sondn',
  database: 'equipment_management',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function query(sql: string, params?: any[]) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

export default pool;
