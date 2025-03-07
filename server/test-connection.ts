
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Tải biến môi trường từ .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('Đường dẫn môi trường hiện tại:', process.cwd());
console.log('Thông tin kết nối:');
console.log('Host từ env:', process.env.DB_HOST);
console.log('User từ env:', process.env.DB_USER);
console.log('Database từ env:', process.env.DB_NAME);
console.log('Port từ env:', process.env.DB_PORT);

async function testConnection() {
  try {
    // Sử dụng trực tiếp giá trị IP thay vì đọc từ biến môi trường
    const connection = await mysql.createConnection({
      host: '34.133.56.193',
      user: 'sondn',
      password: 'sondn',
      database: 'equipment_management',
      port: 3306
    });

    console.log('Kết nối MySQL thành công!');
    
    // Thử tạo database và các bảng
    await connection.query(`CREATE DATABASE IF NOT EXISTS equipment_management`);
    console.log('Database đã được tạo hoặc đã tồn tại');

    // Đọc file schema.sql
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
