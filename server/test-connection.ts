import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT)
    });

    console.log('Kết nối MySQL thành công!');
    
    // Thử tạo database và các bảng
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log('Database đã được tạo hoặc đã tồn tại');

    // Đọc file schema.sql
    const fs = require('fs');
    const path = require('path');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    // Thực thi từng câu lệnh SQL
    const queries = schema.split(';').filter(query => query.trim());
    for (const query of queries) {
      if (query.trim()) {
        await connection.query(query);
      }
    }
    console.log('Các bảng đã được tạo thành công!');

    await connection.end();
  } catch (error) {
    console.error('Lỗi kết nối MySQL:', error);
    process.exit(1);
  }
}

testConnection();
