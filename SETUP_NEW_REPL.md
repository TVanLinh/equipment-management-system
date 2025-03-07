# Hướng dẫn tạo Repl mới cho ứng dụng Mobile

## Bước 1: Tạo Repl mới
1. Truy cập [Replit.com](https://replit.com)
2. Click "Create Repl"
3. Chọn template "React Native"
4. Đặt tên: "equipment-management-mobile"
5. Click "Create Repl"

## Bước 2: Cấu trúc thư mục
Copy các file sau từ thư mục mobile hiện tại sang Repl mới:
```
├── App.tsx
├── screens/
│   ├── QRScanScreen.tsx
│   └── EquipmentDetailScreen.tsx
├── package.json
└── README.md
```

## Bước 3: Cài đặt dependencies
Chạy lệnh sau trong Repl mới:
```bash
npm install @react-navigation/native @react-navigation/native-stack expo-barcode-scanner react-native-safe-area-context react-native-screens
```

## Bước 4: Cấu hình API
Trong file `screens/EquipmentDetailScreen.tsx`, cập nhật API endpoint để trỏ đến server chính:
```typescript
const API_URL = 'https://equipment-management-system.your-username.repl.co';
```

## Bước 5: Kiểm tra ứng dụng
1. Cài đặt Expo Go trên điện thoại
2. Chạy `npm start` trong Repl mới
3. Quét mã QR bằng Expo Go để chạy ứng dụng

## Lưu ý
- Đảm bảo server chính đã được cấu hình CORS để cho phép request từ ứng dụng mobile
- Kiểm tra kết nối mạng giữa điện thoại và server
