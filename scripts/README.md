# Scripts Utility

Các script tiện ích cho dự án:

## init-mysql.ts

Script này dùng để khởi tạo MySQL database và các bảng cần thiết.

### Cách sử dụng:

1. Đảm bảo đã có file `.env` với các thông tin kết nối MySQL:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=equipment_management
DB_PORT=3306
```

2. Chạy script:
```bash
npx tsx scripts/init-mysql.ts
```

Script sẽ:
- Tạo database nếu chưa tồn tại
- Tạo các bảng từ file schema.sql
- Thông báo kết quả thực thi

### Lưu ý:
- Đảm bảo MySQL server đã được cài đặt và đang chạy
- User MySQL cần có quyền tạo database và bảng
- Backup dữ liệu (nếu có) trước khi chạy script
