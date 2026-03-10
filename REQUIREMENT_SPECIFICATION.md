# REQUIREMENT SPECIFICATION - FoodStack QR Service Platform

## 📋 Mô tả hệ thống

**FoodStack** là nền tảng đặt món ăn qua QR code đa nhà hàng (multi-tenant), cho phép khách hàng quét mã QR tại bàn để xem menu, đặt món và thanh toán trực tuyến. Hệ thống hỗ trợ quản lý nhà hàng, chi nhánh, menu, đơn hàng và thanh toán tự động.

---

## 👥 Các vai trò người dùng

### 1. Restaurant Owner (Chủ nhà hàng)
- Sở hữu và quản lý một hoặc nhiều nhà hàng
- Quản lý toàn bộ hệ thống nhà hàng của mình
- Xem báo cáo và thống kê tổng quan

### 2. Manager (Quản lý chi nhánh)
- Quản lý một hoặc nhiều chi nhánh
- Quản lý menu, bàn, đơn hàng tại chi nhánh
- Xem báo cáo chi nhánh

### 3. Staff (Nhân viên)
- Xử lý đơn hàng
- Xử lý yêu cầu phục vụ
- Cập nhật trạng thái bàn

### 4. Customer (Khách hàng)
- Quét QR code tại bàn
- Xem menu và đặt món
- Thanh toán trực tuyến
- Đánh giá món ăn

---

## 🎯 Chức năng hệ thống

### A. AUTHENTICATION & AUTHORIZATION (Xác thực & Phân quyền)

#### Owner có thể:
- **Đăng ký nhà hàng mới**
  - Nhập thông tin nhà hàng (tên, địa chỉ, email, số điện thoại)
  - Tạo tài khoản owner với email và mật khẩu
  - Xác thực email qua OTP
  - Tự động tạo chi nhánh mặc định

- **Đăng nhập hệ thống**
  - Đăng nhập bằng email/password
  - Nhận JWT access token và refresh token
  - Tự động refresh token khi hết hạn

- **Quản lý tài khoản**
  - Đổi mật khẩu
  - Quên mật khẩu (reset qua email)
  - Cập nhật thông tin cá nhân
  - Đăng xuất

---

### B. RESTAURANT MANAGEMENT (Quản lý nhà hàng)

#### Owner có thể:
- **Tạo nhà hàng mới**
  - Nhập thông tin cơ bản (tên, địa chỉ, email, phone)
  - Upload logo nhà hàng
  - Thiết lập thông tin liên hệ

- **Cập nhật thông tin nhà hàng**
  - Sửa tên, địa chỉ, số điện thoại
  - Thay đổi logo
  - Cập nhật email liên hệ

- **Xem thống kê nhà hàng**
  - Tổng số chi nhánh
  - Tổng doanh thu
  - Số đơn hàng
  - Số khách hàng

- **Xóa nhà hàng** (soft delete)
  - Đánh dấu xóa, không xóa vật lý
  - Lưu lịch sử

---

### C. BRANCH MANAGEMENT (Quản lý chi nhánh)

#### Owner/Manager có thể:
- **Tạo chi nhánh mới**
  - Nhập tên chi nhánh
  - Địa chỉ chi tiết
  - Số điện thoại chi nhánh
  - Trạng thái hoạt động (ACTIVE/INACTIVE)

- **Cập nhật thông tin chi nhánh**
  - Sửa tên, địa chỉ
  - Thay đổi số điện thoại
  - Cập nhật giờ mở/đóng cửa

- **Xem danh sách chi nhánh**
  - Phân trang
  - Lọc theo trạng thái
  - Tìm kiếm theo tên

- **Xem thống kê chi nhánh**
  - Số bàn
  - Số đơn hàng hôm nay
  - Doanh thu hôm nay
  - Số nhân viên

- **Đóng/mở chi nhánh**
  - Thay đổi trạng thái
  - Thông báo cho khách hàng

- **Xóa chi nhánh** (soft delete)

---

### D. TABLE & AREA MANAGEMENT (Quản lý bàn & khu vực)

#### Manager/Staff có thể:
- **Quản lý khu vực**
  - Tạo khu vực (Main Hall, VIP, Outdoor, Rooftop)
  - Cập nhật tên khu vực
  - Sắp xếp thứ tự hiển thị
  - Xóa khu vực

- **Quản lý bàn**
  - Tạo bàn mới với số bàn
  - Chọn khu vực cho bàn
  - Thiết lập số chỗ ngồi
  - Tạo QR code tự động cho mỗi bàn
  - Cập nhật thông tin bàn
  - Xóa bàn

- **Quản lý QR code**
  - Tạo QR code mới cho bàn
  - Tái tạo QR code (khi bị mất/hỏng)
  - Download QR code để in
  - Xem thông tin bàn qua QR

- **Quản lý trạng thái bàn**
  - AVAILABLE (Trống)
  - OCCUPIED (Đang sử dụng)
  - RESERVED (Đã đặt)
  - CLEANING (Đang dọn dẹp)

- **Gộp bàn**
  - Gộp nhiều bàn thành một
  - Tách bàn
  - Chuyển bàn

#### Customer có thể:
- **Quét QR code**
  - Quét mã QR tại bàn
  - Tự động nhận diện bàn và chi nhánh
  - Xem menu của chi nhánh

---

### E. MENU MANAGEMENT (Quản lý thực đơn)

#### Manager có thể:
- **Quản lý danh mục**
  - Tạo danh mục món (Appetizers, Main Course, Desserts, Drinks)
  - Cập nhật tên danh mục
  - Sắp xếp thứ tự hiển thị
  - Xóa danh mục

- **Quản lý món ăn**
  - Tạo món ăn mới
    - Tên món
    - Mô tả
    - Giá
    - Danh mục
    - Hình ảnh
  - Cập nhật thông tin món
  - Upload/thay đổi hình ảnh món
  - Đánh dấu hết hàng/còn hàng
  - Xóa món (soft delete)

- **Quản lý tùy chọn món (Customization)**
  - Tạo nhóm tùy chọn (Size, Topping, Spicy Level)
  - Thêm các lựa chọn vào nhóm
    - Tên lựa chọn
    - Giá thêm/bớt
    - Số lượng tối thiểu/tối đa
  - Gán nhóm tùy chọn cho món ăn

- **Tìm kiếm món ăn**
  - Tìm theo tên
  - Lọc theo danh mục
  - Lọc theo giá
  - Lọc theo tình trạng

#### Customer có thể:
- **Xem menu đầy đủ**
  - Xem theo danh mục
  - Xem hình ảnh món
  - Xem giá và mô tả
  - Xem các tùy chọn

- **Tìm kiếm món**
  - Tìm theo tên
  - Lọc theo danh mục
  - Sắp xếp theo giá

---

### F. ORDER MANAGEMENT (Quản lý đơn hàng)

#### Customer có thể:
- **Tạo đơn hàng**
  - Chọn món từ menu
  - Chọn số lượng
  - Chọn tùy chọn (size, topping)
  - Thêm ghi chú cho món
  - Xem tổng tiền tạm tính
  - Xác nhận đặt món

- **Quản lý đơn hàng**
  - Xem chi tiết đơn hàng
  - Thêm món vào đơn đang mở
  - Xóa món khỏi đơn
  - Cập nhật số lượng món
  - Hủy đơn hàng (nếu chưa xác nhận)

- **Xem lịch sử đơn hàng**
  - Xem các đơn đã đặt
  - Xem trạng thái đơn
  - Xem hóa đơn

#### Staff có thể:
- **Xử lý đơn hàng**
  - Xem danh sách đơn mới
  - Xác nhận đơn hàng
  - Cập nhật trạng thái:
    - PENDING (Chờ xác nhận)
    - CONFIRMED (Đã xác nhận)
    - PREPARING (Đang chuẩn bị)
    - READY (Sẵn sàng phục vụ)
    - SERVED (Đã phục vụ)
    - COMPLETED (Hoàn thành)
    - CANCELLED (Đã hủy)

- **Xem đơn hàng theo chi nhánh**
  - Lọc theo trạng thái
  - Lọc theo bàn
  - Lọc theo thời gian

- **Xem lịch sử thay đổi đơn**
  - Ai thay đổi
  - Thay đổi gì
  - Khi nào

---

### G. PAYMENT MANAGEMENT (Quản lý thanh toán)

#### Customer có thể:
- **Thanh toán đơn hàng**
  - Xem tổng tiền (subtotal + tax + service charge)
  - Chọn phương thức thanh toán
  - Thanh toán qua PayOS
  - Nhận thông báo thanh toán thành công/thất bại
  - Xem hóa đơn điện tử

- **Xem lịch sử thanh toán**
  - Xem các giao dịch đã thực hiện
  - Download hóa đơn

#### Staff/Manager có thể:
- **Xử lý thanh toán**
  - Xác nhận thanh toán
  - Xử lý hoàn tiền (nếu cần)
  - Thử lại thanh toán thất bại

- **Xem thống kê thanh toán**
  - Tổng doanh thu
  - Số giao dịch thành công/thất bại
  - Phương thức thanh toán phổ biến
  - Doanh thu theo thời gian

- **Tạo hóa đơn**
  - Tạo hóa đơn cho đơn hàng
  - Gửi hóa đơn qua email
  - In hóa đơn

---

### H. RESERVATION MANAGEMENT (Quản lý đặt bàn)

#### Customer có thể:
- **Đặt bàn trước**
  - Chọn chi nhánh
  - Chọn ngày giờ
  - Chọn số người
  - Nhập thông tin liên hệ
  - Ghi chú yêu cầu đặc biệt

- **Quản lý đặt bàn**
  - Xem chi tiết đặt bàn
  - Cập nhật thông tin
  - Hủy đặt bàn

#### Staff có thể:
- **Xử lý đặt bàn**
  - Xem danh sách đặt bàn
  - Xác nhận đặt bàn
  - Từ chối đặt bàn (nếu hết chỗ)
  - Gán bàn cho khách
  - Đánh dấu khách đã đến

- **Kiểm tra bàn trống**
  - Xem bàn trống theo thời gian
  - Xem lịch đặt bàn

---

### I. SERVICE REQUEST MANAGEMENT (Quản lý yêu cầu phục vụ)

#### Customer có thể:
- **Gọi phục vụ**
  - Yêu cầu thêm nước
  - Yêu cầu dọn bàn
  - Yêu cầu hỗ trợ
  - Yêu cầu thanh toán
  - Ghi chú yêu cầu

#### Staff có thể:
- **Xử lý yêu cầu**
  - Xem danh sách yêu cầu chờ
  - Xác nhận đã nhận yêu cầu
  - Gán yêu cầu cho nhân viên
  - Đánh dấu hoàn thành
  - Xem thống kê yêu cầu

---

### J. USER & STAFF MANAGEMENT (Quản lý nhân viên)

#### Owner/Manager có thể:
- **Quản lý nhân viên**
  - Tạo tài khoản nhân viên
    - Email
    - Mật khẩu
    - Họ tên
    - Số điện thoại
    - Vai trò (Manager/Staff)
  - Cập nhật thông tin nhân viên
  - Gán nhân viên vào chi nhánh
  - Thay đổi vai trò
  - Kích hoạt/vô hiệu hóa tài khoản
  - Xóa nhân viên

- **Xem danh sách nhân viên**
  - Lọc theo chi nhánh
  - Lọc theo vai trò
  - Lọc theo trạng thái

- **Xem lịch sử hoạt động**
  - Xem nhân viên đã làm gì
  - Xem thời gian hoạt động
  - Xem hiệu suất

---

### K. SUBSCRIPTION MANAGEMENT (Quản lý gói dịch vụ)

#### Owner có thể:
- **Quản lý subscription**
  - Xem gói hiện tại
  - Nâng cấp gói
  - Hủy gói
  - Gia hạn gói
  - Xem lịch sử thanh toán gói

- **Kiểm tra giới hạn**
  - Số chi nhánh tối đa
  - Số bàn tối đa
  - Số món ăn tối đa
  - Các tính năng được phép

---

### L. FEEDBACK & RATING MANAGEMENT (Quản lý đánh giá)

#### Customer có thể:
- **Đánh giá sau bữa ăn**
  - Đánh giá tổng thể (1-5 sao)
  - Đánh giá món ăn
  - Đánh giá phục vụ
  - Đánh giá không gian
  - Viết nhận xét
  - Đánh giá ẩn danh (tùy chọn)

#### Owner/Manager có thể:
- **Xem đánh giá**
  - Xem tất cả đánh giá
  - Lọc theo rating
  - Lọc theo thời gian
  - Xem đánh giá theo món

- **Phản hồi đánh giá**
  - Trả lời nhận xét khách hàng
  - Cảm ơn khách hàng

- **Xem thống kê đánh giá**
  - Điểm trung bình
  - Phân bố rating
  - Món được đánh giá cao nhất
  - Xu hướng đánh giá

---

### M. ANALYTICS & REPORTING (Phân tích & Báo cáo)

#### Owner/Manager có thể:
- **Xem dashboard tổng quan**
  - Doanh thu hôm nay/tuần/tháng
  - Số đơn hàng
  - Số khách hàng
  - Món bán chạy
  - Biểu đồ doanh thu

- **Báo cáo doanh thu**
  - Doanh thu theo ngày/tuần/tháng/năm
  - Doanh thu theo chi nhánh
  - Doanh thu theo món
  - So sánh với kỳ trước

- **Phân tích món ăn**
  - Món bán chạy nhất
  - Món ít bán
  - Doanh thu theo món
  - Đánh giá theo món

- **Phân tích giờ cao điểm**
  - Giờ có nhiều khách nhất
  - Giờ có doanh thu cao nhất
  - Xu hướng theo ngày trong tuần

- **Phân tích bàn**
  - Tỷ lệ luân chuyển bàn
  - Thời gian trung bình mỗi bàn
  - Bàn được sử dụng nhiều nhất

- **Hiệu suất nhân viên**
  - Số đơn xử lý
  - Thời gian xử lý trung bình
  - Đánh giá từ khách hàng

- **Xuất báo cáo**
  - Xuất Excel
  - Xuất PDF
  - Gửi email báo cáo định kỳ

- **Phân tích hành vi khách hàng**
  - Món thường đặt cùng nhau
  - Giá trị đơn hàng trung bình
  - Tần suất quay lại

---

### N. NOTIFICATION SYSTEM (Hệ thống thông báo)

#### Hệ thống tự động gửi thông báo:
- **Thông báo đơn hàng**
  - Đơn hàng mới cho staff
  - Xác nhận đơn cho khách
  - Đơn sẵn sàng phục vụ
  - Đơn hoàn thành

- **Thông báo thanh toán**
  - Thanh toán thành công
  - Thanh toán thất bại
  - Hóa đơn điện tử

- **Thông báo yêu cầu phục vụ**
  - Yêu cầu mới cho staff
  - Xác nhận đã nhận yêu cầu
  - Hoàn thành yêu cầu

- **Thông báo đặt bàn**
  - Xác nhận đặt bàn
  - Nhắc nhở trước giờ đặt
  - Hủy đặt bàn

#### User có thể:
- **Xem lịch sử thông báo**
  - Xem tất cả thông báo
  - Đánh dấu đã đọc
  - Xóa thông báo

---

## 📊 Tổng kết Features

### Customer Features (Khách hàng):
1. Quét QR code tại bàn
2. Xem menu đầy đủ với hình ảnh
3. Tìm kiếm và lọc món ăn
4. Đặt món với tùy chọn
5. Thêm/xóa/cập nhật món trong đơn
6. Xem tổng tiền real-time
7. Thanh toán online qua PayOS
8. Xem lịch sử đơn hàng
9. Đặt bàn trước
10. Gọi phục vụ
11. Đánh giá món ăn và dịch vụ
12. Nhận thông báo real-time

### Restaurant Owner Features (Chủ nhà hàng):
1. Đăng ký và quản lý nhà hàng
2. Tạo và quản lý nhiều chi nhánh
3. Upload logo nhà hàng
4. Quản lý subscription
5. Xem dashboard tổng quan
6. Xem báo cáo doanh thu chi tiết
7. Phân tích kinh doanh
8. Quản lý nhân viên
9. Xuất báo cáo Excel/PDF
10. Xem thống kê toàn hệ thống

### Manager Features (Quản lý chi nhánh):
1. Quản lý thông tin chi nhánh
2. Tạo và quản lý khu vực/bàn
3. Tạo QR code cho bàn
4. Quản lý menu và danh mục
5. Upload hình ảnh món ăn
6. Quản lý tùy chọn món
7. Xử lý đơn hàng
8. Xử lý đặt bàn
9. Xem báo cáo chi nhánh
10. Quản lý nhân viên chi nhánh
11. Phản hồi đánh giá khách hàng

### Staff Features (Nhân viên):
1. Xem và xử lý đơn hàng
2. Cập nhật trạng thái đơn
3. Xử lý yêu cầu phục vụ
4. Cập nhật trạng thái bàn
5. Xác nhận đặt bàn
6. Xử lý thanh toán
7. Nhận thông báo real-time
8. Xem lịch sử hoạt động

---

## 🎯 Độ ưu tiên tính năng

### P0 - CRITICAL (MVP - Must have)
- Authentication & Authorization
- Restaurant & Branch Management
- Table & QR Management
- Menu Management
- Order Management
- Payment Integration

### P1 - HIGH (Launch)
- Service Request
- Staff Management
- Subscription Management
- Basic Analytics

### P2 - MEDIUM (Post-launch)
- Reservation System
- Feedback & Rating
- Advanced Analytics
- Notification System

---

**Version:** 1.0  
**Last Updated:** 2024  
**Status:** Ready for Development
