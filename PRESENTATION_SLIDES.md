# FoodStack Mobile - Presentation Slides

---

## Slide 1: Title Slide
**FoodStack Mobile**
*Giải pháp đặt món thông minh cho nhà hàng*

Nhóm phát triển: [Tên nhóm]
Ngày: [Ngày thuyết trình]

---

## Slide 2: Tổng quan dự án

### Vấn đề
- Khách hàng phải chờ đợi lâu để gọi món
- Nhà hàng khó quản lý đơn hàng hiệu quả
- Thiếu công cụ quản trị tập trung cho hệ thống

### Giải pháp
**FoodStack Mobile** - Ứng dụng di động đặt món ăn với 3 vai trò:
- 👥 Khách hàng
- 🏪 Nhà hàng
- 👨‍💼 Quản trị viên

---

## Slide 3: Công nghệ sử dụng

### Frontend Mobile
- React Native + Expo
- TypeScript
- React Navigation
- Linear Gradient

### Backend
- Node.js + Express
- PostgreSQL
- Prisma ORM
- JWT Authentication

### Tools
- Git/GitHub
- VS Code
- Postman

---

## Slide 4: Kiến trúc hệ thống

```
┌─────────────────┐
│  Mobile App     │
│  (React Native) │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   REST API      │
│   (Node.js)     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Database      │
│  (PostgreSQL)   │
└─────────────────┘
```

---

## Slide 5: Chức năng - Khách hàng

### 🔐 Xác thực
- Đăng ký/Đăng nhập
- Quên mật khẩu
- Xác thực email

### 🍽️ Đặt món
- Quét QR code tại bàn
- Chọn nhà hàng thủ công
- Duyệt menu theo danh mục
- Tìm kiếm món ăn
- Thêm vào giỏ hàng

### 📱 Tiện ích
- Lịch sử đơn hàng
- Ưu đãi đặc biệt
- Nhập mã voucher
- Theo dõi trạng thái đơn

---

## Slide 6: Chức năng - Nhà hàng

### 📊 Dashboard
- Thống kê doanh thu
- Số đơn hàng hôm nay
- Đơn chờ xử lý
- Hoạt động gần đây

### 🍔 Quản lý Menu
- Thêm/Sửa/Xóa món ăn
- Phân loại theo danh mục
- Cập nhật giá
- Quản lý tùy chọn món

### 📦 Quản lý Đơn hàng
- Xem đơn hàng mới
- Xác nhận đơn hàng
- Cập nhật trạng thái
- Lịch sử đơn hàng

### ⚙️ Cài đặt
- Thông tin nhà hàng
- Giờ hoạt động
- Cài đặt đơn hàng
- Đăng xuất

---

## Slide 7: Chức năng - Admin

### 🎯 Dashboard Tổng quan
- Tổng số nhà hàng
- Tổng người dùng
- Tổng đơn hàng
- Doanh thu hệ thống

### 🏪 Quản lý Nhà hàng
- Danh sách nhà hàng
- Phê duyệt nhà hàng mới
- Tạm ngưng/Kích hoạt
- Xem chi tiết

### 👥 Quản lý Người dùng
- Danh sách users
- Phân quyền
- Khóa/Mở khóa tài khoản

### 📈 Báo cáo & Thống kê
- Doanh thu theo thời gian
- Top nhà hàng
- Phân tích người dùng

---

## Slide 8: Giao diện người dùng

### Thiết kế hiện đại
- Material Design
- Gradient màu sắc
- Icon đơn giản, dễ hiểu
- Animation mượt mà

### Trải nghiệm người dùng
- Navigation trực quan
- Tìm kiếm nhanh
- Lọc theo danh mục
- Responsive design

---

## Slide 9: Luồng đặt món

```
1. Khách hàng đăng nhập
   ↓
2. Quét QR hoặc chọn nhà hàng
   ↓
3. Nhập số bàn
   ↓
4. Duyệt menu & chọn món
   ↓
5. Thêm vào giỏ hàng
   ↓
6. Xác nhận đơn hàng
   ↓
7. Nhân viên xác nhận
   ↓
8. Theo dõi trạng thái
   ↓
9. Thanh toán
```

---

## Slide 10: Database Schema

### Các bảng chính
- **users** - Thông tin người dùng
- **restaurants** - Thông tin nhà hàng
- **menu_items** - Món ăn
- **orders** - Đơn hàng
- **order_items** - Chi tiết đơn hàng
- **tables** - Bàn ăn
- **sessions** - Phiên đặt món

### Quan hệ
- 1 Restaurant → N Menu Items
- 1 Order → N Order Items
- 1 User → N Orders

---

## Slide 11: Tài khoản Demo

### Khách hàng
```
Email: customer@test.com
Password: password123
```

### Nhà hàng
```
Email: owner@restaurant.com
Password: password123
```

### Admin
```
Email: admin@foodstack.com
Password: admin123
```

---

## Slide 12: Tính năng nổi bật

### ✨ Điểm mạnh
- Đa vai trò (Customer, Restaurant, Admin)
- QR Code scanning
- Real-time order tracking
- Quản lý tập trung
- UI/UX hiện đại
- Mock data sẵn sàng test

### 🚀 Khả năng mở rộng
- Tích hợp thanh toán online
- Push notification
- Chat với nhà hàng
- Đánh giá & review
- Loyalty program

---

## Slide 13: Thách thức & Giải pháp

### Thách thức
- Đồng bộ dữ liệu real-time
- Quản lý nhiều vai trò
- Bảo mật thông tin

### Giải pháp
- JWT authentication
- Role-based access control
- Input validation
- Error handling
- Mock data cho development

---

## Slide 14: Kết quả đạt được

### ✅ Hoàn thành
- 3 module chính (Customer, Restaurant, Admin)
- 25+ màn hình
- Authentication & Authorization
- CRUD operations đầy đủ
- UI/UX hoàn chỉnh

### 📊 Số liệu
- 7 màn hình Admin
- 10+ màn hình Customer
- 5 màn hình Restaurant
- 3 tài khoản demo

---

## Slide 15: Demo

### Luồng demo
1. **Đăng nhập Admin**
   - Xem dashboard
   - Quản lý nhà hàng
   - Phê duyệt

2. **Đăng nhập Restaurant**
   - Xem dashboard
   - Quản lý menu
   - Xử lý đơn hàng

3. **Đăng nhập Customer**
   - Chọn nhà hàng
   - Đặt món
   - Xem lịch sử

---

## Slide 16: Hướng phát triển

### Giai đoạn tiếp theo
- Tích hợp API backend thực
- Payment gateway
- Push notifications
- Real-time updates (WebSocket)
- Analytics & reporting
- Multi-language support

### Tối ưu hóa
- Performance optimization
- Offline mode
- Caching strategy
- Security enhancement

---

## Slide 17: Kết luận

### Thành tựu
- Xây dựng thành công ứng dụng đa vai trò
- Giao diện hiện đại, dễ sử dụng
- Kiến trúc mở rộng tốt
- Sẵn sàng tích hợp backend

### Bài học
- Quản lý state trong React Native
- Navigation phức tạp
- TypeScript best practices
- UI/UX design principles

---

## Slide 18: Q&A

### Câu hỏi thường gặp

**Q: App có hoạt động offline không?**
A: Hiện tại chưa, sẽ phát triển trong tương lai

**Q: Có hỗ trợ nhiều ngôn ngữ?**
A: Hiện tại tiếng Việt, có thể mở rộng

**Q: Bảo mật như thế nào?**
A: JWT authentication, role-based access

---

## Slide 19: Tài liệu tham khảo

### Source Code
- GitHub: [Repository URL]
- Documentation: README.md

### Tài liệu kỹ thuật
- API Documentation
- Database Schema
- User Guide

### Contact
- Email: [Email]
- Phone: [Phone]

---

## Slide 20: Thank You!

**FoodStack Mobile**
*Cảm ơn đã lắng nghe!*

Questions?

---

# Ghi chú cho người thuyết trình

## Slide 1-3: Giới thiệu (3 phút)
- Giới thiệu vấn đề và giải pháp
- Nêu công nghệ sử dụng
- Giải thích kiến trúc tổng quan

## Slide 4-7: Chức năng (5 phút)
- Chi tiết từng vai trò
- Nhấn mạnh tính năng nổi bật
- Giải thích luồng hoạt động

## Slide 8-14: Kỹ thuật (4 phút)
- Database design
- UI/UX approach
- Thách thức và giải pháp

## Slide 15: Demo (5 phút)
- Demo trực tiếp trên thiết bị
- Thao tác với 3 vai trò
- Highlight các tính năng chính

## Slide 16-18: Kết luận (2 phút)
- Tổng kết thành tựu
- Hướng phát triển
- Mở phần Q&A

## Slide 19-20: Q&A (5 phút)
- Trả lời câu hỏi
- Cảm ơn và kết thúc
