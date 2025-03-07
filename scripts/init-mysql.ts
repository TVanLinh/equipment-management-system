
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function initializeMySQL() {
  try {
    // Kết nối đến MySQL server với IP trực tiếp
    const connection = await mysql.createConnection({
      host: '34.133.56.193',
      user: 'sondn',
      password: 'sondn',
      port: 3306
    });

    // Tạo database nếu chưa tồn tại
    await connection.query(`CREATE DATABASE IF NOT EXISTS equipment_management`);
    console.log(`Database equipment_management đã được tạo hoặc đã tồn tại`);

    // Chọn database để sử dụng
    await connection.query(`USE equipment_management`);

    // Đọc file schema.sql
    const schemaPath = path.join(__dirname, '..', 'server', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Thực thi từng câu lệnh SQL
    const queries = schema.split(';').filter(query => query.trim());
    for (const query of queries) {
      if (query.trim()) {
        await connection.query(query);
        console.log('Đã thực thi câu lệnh:', query.trim().split('\n')[0]);
      }
    }

    console.log('Đã khởi tạo database thành công!');
    await connection.end();

  } catch (error) {
    console.error('Lỗi khởi tạo MySQL:', error);
    process.exit(1);
  }
}

initializeMySQL();
