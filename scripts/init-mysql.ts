import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function initializeMySQL() {
  try {
    // Kết nối đến MySQL server
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT)
    });

    // Tạo database nếu chưa tồn tại
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Database ${process.env.DB_NAME} đã được tạo hoặc đã tồn tại`);

    // Chọn database để sử dụng
    await connection.query(`USE ${process.env.DB_NAME}`);

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

// Chạy script
initializeMySQL();
