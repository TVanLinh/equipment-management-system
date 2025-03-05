# Tài liệu Hệ thống Quản lý Thiết bị Y tế

## 1. Tổng quan
Hệ thống Quản lý Thiết bị Y tế là một ứng dụng web được thiết kế để theo dõi và quản lý thiết bị y tế trong môi trường bệnh viện. Hệ thống cung cấp giao diện thân thiện với người dùng và hỗ trợ đa ngôn ngữ (Tiếng Việt).

## 2. Chức năng chính
### 2.1. Quản lý thiết bị
- Xem danh sách thiết bị
- Thêm thiết bị mới
- Chỉnh sửa thông tin thiết bị
- Xem chi tiết thiết bị
- Import danh sách thiết bị từ file Excel/CSV
- Lọc và tìm kiếm thiết bị

### 2.2. Quản lý bảo trì
- Yêu cầu bảo trì thiết bị
- Theo dõi lịch sử bảo trì
- Cập nhật trạng thái bảo trì

### 2.3. Quản lý người dùng
- Đăng nhập/Đăng xuất
- Phân quyền người dùng (Admin, Manager, User)
- Quản lý thông tin người dùng
- Đặt lại mật khẩu

### 2.4. Quản lý phòng ban
- Xem danh sách phòng ban
- Phân công thiết bị cho phòng ban

## 3. Phân quyền người dùng
### 3.1. Admin
- Quyền truy cập toàn bộ hệ thống
- Quản lý người dùng và phân quyền
- Import/Export dữ liệu
- Quản lý thiết bị và phòng ban

### 3.2. Manager
- Quản lý thiết bị
- Xem báo cáo và thống kê
- Phê duyệt yêu cầu bảo trì

### 3.3. User
- Xem thiết bị trong phòng ban của mình
- Yêu cầu bảo trì thiết bị
- Xem lịch sử bảo trì

## 4. Màn hình chính

### 4.1. Màn hình đăng nhập
![Login Screen]
- Đăng nhập bằng tên đăng nhập và mật khẩu
- Hiển thị thông báo lỗi khi đăng nhập không thành công

### 4.2. Trang chủ - Danh sách thiết bị
![Equipment List]
- Bảng danh sách thiết bị với các cột: Mã thiết bị, Tên thiết bị, Khoa, Trạng thái, Ngày bảo trì
- Thanh tìm kiếm và bộ lọc
- Phân trang
- Nút thêm thiết bị mới (cho Admin/Manager)

### 4.3. Chi tiết thiết bị
![Equipment Details]
- Hiển thị thông tin chi tiết của thiết bị
- Thông tin cơ bản: Mã, tên, loại thiết bị
- Thông tin sản xuất: Hãng, nước sản xuất, nhà cung cấp
- Thông tin tài chính: Đơn giá, VAT, nguồn kinh phí
- Trạng thái và thời hạn bảo hành
- Nút yêu cầu bảo trì (cho User)
- Nút chỉnh sửa (cho Admin/Manager)

### 4.4. Quản lý người dùng
![User Management]
- Danh sách người dùng
- Thông tin: Tên đăng nhập, Tên đầy đủ, Khoa, Quyền
- Chức năng đặt lại mật khẩu
- Thêm người dùng mới

### 4.5. Quản lý bảo trì
![Maintenance Management]
- Lịch sử bảo trì thiết bị
- Form yêu cầu bảo trì với các trường:
  + Lý do yêu cầu
  + Ghi chú bổ sung
  + Ngày bắt đầu/kết thúc dự kiến

## 5. Kiến trúc kỹ thuật

### 5.1. Frontend
- React với TypeScript
- Tailwind CSS cho styling
- Shadcn UI cho components
- React Query cho state management
- Wouter cho routing

### 5.2. Backend
- Express.js với TypeScript
- In-memory storage cho data persistence
- Session-based authentication
- RESTful API endpoints

### 5.3. Tính năng kỹ thuật
- Responsive design
- Form validation với Zod
- Real-time updates
- File upload/download
- Error handling
- Logging system

## 6. Quy trình làm việc

### 6.1. Yêu cầu bảo trì
1. User truy cập trang chi tiết thiết bị
2. Click nút "Yêu cầu bảo trì"
3. Điền form yêu cầu bảo trì
4. Hệ thống cập nhật trạng thái thiết bị
5. Admin/Manager xem xét và phê duyệt

### 6.2. Import thiết bị
1. Admin/Manager truy cập trang danh sách thiết bị
2. Click nút "Import"
3. Tải template mẫu (Excel/CSV)
4. Upload file đã điền thông tin
5. Hệ thống validate và import dữ liệu

## 7. Dự định phát triển
- [ ] Tích hợp PostgreSQL database
- [ ] Thêm tính năng tìm kiếm nâng cao
- [ ] Xuất báo cáo
- [ ] Hỗ trợ đính kèm file cho thiết bị
