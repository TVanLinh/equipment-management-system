# Equipment Management Mobile App

Ứng dụng mobile cho hệ thống quản lý thiết bị y tế, cho phép quét mã QR để xem thông tin chi tiết thiết bị.

## Cài đặt

1. Cài đặt Node.js và npm
2. Cài đặt Expo CLI:
```bash
npm install -g expo-cli
```

3. Cài đặt dependencies:
```bash
cd mobile
npm install
```

4. Chạy ứng dụng:
```bash
npm start
```

5. Cài đặt ứng dụng Expo Go trên điện thoại và quét mã QR để chạy ứng dụng

## Lưu ý

- Cần cập nhật API endpoint trong file `screens/EquipmentDetailScreen.tsx` để phù hợp với server của bạn
- Đảm bảo điện thoại và máy chủ nằm trong cùng một mạng để có thể kết nối

## Tính năng

- Quét mã QR chứa Equipment ID
- Hiển thị thông tin chi tiết thiết bị
- Giao diện thân thiện, dễ sử dụng
- Hỗ trợ định dạng tiền tệ và ngày tháng theo tiếng Việt
