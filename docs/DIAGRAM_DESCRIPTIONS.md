# MÔ TẢ CHỨC NĂNG HỆ THỐNG FOODSTACK QR SERVICE

## 📋 TỔNG QUAN HỆ THỐNG

**FoodStack** là nền tảng quản lý nhà hàng đa chi nhánh (multi-tenant) với tính năng đặt món qua QR code. Hệ thống hỗ trợ quản lý toàn diện từ menu, đơn hàng, thanh toán đến phân tích doanh thu.

---

## 👥 CÁC VAI TRÒ NGƯỜI DÙNG

### 1. Restaurant Owner (Chủ nhà hàng)
- Quản lý toàn bộ hệ thống nhà hàng
- Tạo và quản lý nhiều chi nhánh
- Xem báo cáo tổng quan và phân tích kinh doanh
- Quản lý subscription và thanh toán gói dịch vụ

### 2. Manager (Quản lý chi nhánh)
- Quản lý một hoặc nhiều chi nhánh cụ thể
- Quản lý menu, bàn, khu vực
- Xử lý đơn hàng và đặt bàn
- Quản lý nhân viên chi nhánh

### 3. Staff (Nhân viên)
- Xử lý đơn hàng và cập nhật trạng thái
- Xử lý yêu cầu phục vụ từ khách hàng
- Quản lý trạng thái bàn
- Hỗ trợ thanh toán

### 4. Customer (Khách hàng)
- Quét QR code tại bàn để xem menu
- Đặt món và thanh toán trực tuyến
- Đánh giá món ăn và dịch vụ
- Đặt bàn trước

---

## 🎯 CÁC CHỨC NĂNG CHÍNH

### A. AUTHENTICATION & AUTHORIZATION (Xác thực & Phân quyền)

#### Luồng đăng ký nhà hàng:
1. **Owner đăng ký tài khoản mới**
   - Nhập thông tin cá nhân (tên, email, số điện thoại)
   - Nhập thông tin nhà hàng (tên, địa chỉ, loại hình kinh doanh)
   - Tạo mật khẩu mạnh
   - Hệ thống tự động tạo chi nhánh mặc định

2. **Xác thực email**
   - Gửi OTP qua email
   - Owner nhập OTP để kích hoạt tài khoản
   - Cập nhật trạng thái email_verified = true

3. **Đăng nhập hệ thống**
   - Xác thực email/password
   - Tạo JWT access token (15 phút) và refresh token (7 ngày)
   - Lưu refresh token vào Redis
   - Trả về thông tin user và permissions

#### Quản lý phiên đăng nhập:
- **Refresh token tự động** khi access token hết hạn
- **Logout** xóa refresh token khỏi Redis
- **Forgot password** gửi link reset qua email
- **Change password** yêu cầu mật khẩu cũ

---

### B. RESTAURANT & BRANCH MANAGEMENT (Quản lý nhà hàng & chi nhánh)

#### Quản lý nhà hàng:
1. **Tạo nhà hàng**
   - Owner nhập thông tin cơ bản
   - Upload logo nhà hàng
   - Thiết lập thông tin liên hệ
   - Tự động tạo subscription plan cơ bản

2. **Cập nhật thông tin**
   - Sửa tên, địa chỉ, số điện thoại
   - Thay đổi logo và banner
   - Cập nhật giờ mở/đóng cửa
   - Thiết lập social links

#### Quản lý chi nhánh:
1. **Tạo chi nhánh mới**
   - Kiểm tra giới hạn subscription (max_branches)
   - Nhập tên, địa chỉ, số điện thoại chi nhánh
   - Thiết lập slug cho URL tùy chỉnh
   - Tạo theme và layout mặc định

2. **Customization chi nhánh**
   - Chọn theme màu sắc
   - Upload banner và gallery images
   - Thiết lập slider images
   - Cấu hình layout type (default, modern, minimal)

3. **SEO & Publishing**
   - Thiết lập SEO title, description, keywords
   - Cấu hình custom domain
   - Publish/unpublish chi nhánh
   - Quản lý trạng thái ACTIVE/INACTIVE

---

### C. TABLE & AREA MANAGEMENT (Quản lý bàn & khu vực)

#### Quản lý khu vực:
1. **Tạo khu vực**
   - Tên khu vực (Main Hall, VIP, Outdoor, Rooftop)
   - Sắp xếp thứ tự hiển thị (sort_order)
   - Mô tả khu vực

2. **Quản lý bàn trong khu vực**
   - Tạo bàn với số bàn duy nhất
   - Thiết lập số chỗ ngồi (capacity)
   - Tự động tạo QR token và QR code URL
   - Quản lý trạng thái bàn

#### Hệ thống QR Code:
1. **Tạo QR Code**
   - Mỗi bàn có QR token duy nhất
   - QR code chứa thông tin: branch_id, table_id, qr_token
   - Tạo QR code URL để download và in

2. **Quét QR Code (Customer)**
   - Quét mã QR tại bàn
   - Hệ thống xác định bàn và chi nhánh
   - Chuyển hướng đến menu của chi nhánh
   - Tự động gán session với bàn

#### Trạng thái bàn:
- **AVAILABLE**: Bàn trống, sẵn sàng phục vụ
- **OCCUPIED**: Đang có khách sử dụng
- **RESERVED**: Đã được đặt trước
- **CLEANING**: Đang dọn dẹp

---

### D. MENU MANAGEMENT (Quản lý thực đơn)

#### Quản lý danh mục:
1. **Tạo categories**
   - Tên danh mục (Appetizers, Main Course, Desserts, Drinks)
   - Mô tả danh mục
   - Sắp xếp thứ tự hiển thị (sort_order)
   - Soft delete khi xóa

#### Quản lý món ăn:
1. **Tạo menu items**
   - Tên món, mô tả chi tiết
   - Giá cả và hình ảnh
   - Gán vào category
   - Trạng thái available (còn hàng/hết hàng)

2. **Upload hình ảnh**
   - Upload multiple images cho món ăn
   - Resize và optimize tự động
   - Lưu trữ trên cloud storage

#### Hệ thống Customization:
1. **Customization Groups**
   - Tạo nhóm tùy chọn (Size, Topping, Spicy Level)
   - Thiết lập min_select, max_select
   - Đánh dấu required/optional

2. **Customization Options**
   - Thêm các lựa chọn vào nhóm
   - Thiết lập price_delta (giá thêm/bớt)
   - Sắp xếp thứ tự và trạng thái available

3. **Gán Customization cho món**
   - Liên kết menu_item với customization_group
   - Khách hàng chọn tùy chọn khi đặt món

---

### E. ORDER MANAGEMENT (Quản lý đơn hàng)

#### Luồng đặt món (Customer):
1. **Tạo đơn hàng**
   - Quét QR code để xác định bàn
   - Chọn món từ menu
   - Chọn số lượng và customization
   - Thêm ghi chú cho món
   - Xem tổng tiền real-time

2. **Quản lý giỏ hàng**
   - Thêm/xóa món trong đơn
   - Cập nhật số lượng
   - Thay đổi customization
   - Tính toán subtotal, tax, service_charge

3. **Xác nhận đơn hàng**
   - Review chi tiết đơn hàng
   - Xác nhận đặt món
   - Tạo order với status PENDING

#### Xử lý đơn hàng (Staff):
1. **Nhận đơn mới**
   - Notification real-time cho staff
   - Xem chi tiết đơn hàng
   - Xác nhận hoặc từ chối đơn

2. **Cập nhật trạng thái đơn**
   - **PENDING**: Chờ xác nhận
   - **CONFIRMED**: Đã xác nhận, chuyển bếp
   - **PREPARING**: Đang chuẩn bị món
   - **READY**: Sẵn sàng phục vụ
   - **SERVED**: Đã phục vụ khách
   - **COMPLETED**: Hoàn thành
   - **CANCELLED**: Đã hủy

3. **Quản lý order items**
   - Xem chi tiết từng món trong đơn
   - Cập nhật trạng thái từng món
   - Xử lý customization options
   - Tính toán giá cuối cùng

#### Activity Logging:
- Ghi lại mọi thay đổi đơn hàng
- Lưu old_values và new_values
- Tracking user thực hiện thay đổi
- Lưu IP address và user_agent

---

### F. PAYMENT MANAGEMENT (Quản lý thanh toán)

#### Tích hợp PayOS:
1. **Tạo payment request**
   - Tính toán total amount (subtotal + tax + service_charge)
   - Tạo idempotency_key để tránh duplicate
   - Gửi request đến PayOS API
   - Lưu payos_data (transaction_ref, payment_url)

2. **Xử lý thanh toán**
   - Customer chọn phương thức: QR_PAY, E_WALLET, CASH
   - Redirect đến PayOS payment page
   - Xử lý callback từ PayOS
   - Cập nhật payment status

3. **Webhook handling**
   - Nhận webhook từ PayOS
   - Verify signature
   - Cập nhật payment và order status
   - Gửi notification cho customer

#### Quản lý hóa đơn:
1. **Tạo invoice**
   - Tự động tạo invoice_number
   - Lưu thông tin khách hàng
   - Tính toán chi tiết (subtotal, tax, service_charge)
   - Trạng thái UNPAID/PAID

2. **Xử lý thanh toán**
   - Cập nhật paid_at timestamp
   - Gửi hóa đơn điện tử qua email
   - Lưu lịch sử thanh toán

---

### G. RESERVATION MANAGEMENT (Quản lý đặt bàn)

#### Đặt bàn trước (Customer):
1. **Tạo reservation**
   - Chọn chi nhánh và ngày giờ
   - Nhập số người (party_size)
   - Thông tin liên hệ (tên, phone, email)
   - Ghi chú yêu cầu đặc biệt

2. **Kiểm tra availability**
   - Check bàn trống theo thời gian
   - Tính toán capacity phù hợp
   - Suggest alternative time nếu hết chỗ

#### Xử lý đặt bàn (Staff):
1. **Quản lý reservations**
   - Xem danh sách đặt bàn theo ngày
   - Xác nhận hoặc từ chối đặt bàn
   - Gán bàn cụ thể cho reservation
   - Cập nhật trạng thái: PENDING, CONFIRMED, CANCELLED, COMPLETED

2. **Check-in khách hàng**
   - Đánh dấu khách đã đến
   - Chuyển trạng thái bàn từ RESERVED sang OCCUPIED
   - Tạo order session cho bàn

---

### H. SERVICE REQUEST MANAGEMENT (Quản lý yêu cầu phục vụ)

#### Yêu cầu từ khách hàng:
1. **Gọi phục vụ**
   - Button "Call Service" trên mobile app
   - Chọn loại yêu cầu: thêm nước, dọn bàn, hỗ trợ, thanh toán
   - Thêm ghi chú chi tiết
   - Gửi notification real-time cho staff

#### Xử lý yêu cầu (Staff):
1. **Nhận notification**
   - Real-time notification trên staff app
   - Xem chi tiết yêu cầu và bàn
   - Xác nhận đã nhận yêu cầu

2. **Xử lý và hoàn thành**
   - Gán yêu cầu cho nhân viên cụ thể
   - Cập nhật trạng thái xử lý
   - Đánh dấu hoàn thành
   - Gửi confirmation cho khách

---

### I. USER & STAFF MANAGEMENT (Quản lý nhân viên)

#### Quản lý tài khoản nhân viên:
1. **Tạo tài khoản staff**
   - Owner/Manager tạo tài khoản
   - Gán role: MANAGER hoặc STAFF
   - Gán vào branch_id cụ thể
   - Gửi thông tin đăng nhập qua email

2. **Phân quyền**
   - Hệ thống roles và permissions
   - OWNER: full access toàn hệ thống
   - MANAGER: quản lý chi nhánh được gán
   - STAFF: xử lý đơn hàng và phục vụ

3. **Quản lý trạng thái**
   - ACTIVE: Đang hoạt động
   - INACTIVE: Tạm ngưng
   - Soft delete khi xóa nhân viên

#### Activity Tracking:
- Ghi lại hoạt động của nhân viên
- Tracking login/logout times
- Monitoring performance metrics
- Báo cáo hiệu suất làm việc

---

### J. SUBSCRIPTION MANAGEMENT (Quản lý gói dịch vụ)

#### Subscription Plans:
1. **Basic Plan**
   - 1 chi nhánh
   - 10 bàn tối đa
   - 50 món ăn tối đa
   - Tính năng cơ bản

2. **Premium Plan**
   - 5 chi nhánh
   - 100 bàn tối đa
   - 500 món ăn tối đa
   - Advanced analytics
   - Custom branding

3. **Enterprise Plan**
   - Unlimited chi nhánh
   - Unlimited bàn và món
   - Full features
   - Priority support

#### Feature Limits:
- Kiểm tra giới hạn khi tạo mới
- Thông báo khi đạt giới hạn
- Suggest upgrade plan
- Tự động block tính năng khi hết hạn

---

### K. FEEDBACK & RATING MANAGEMENT (Quản lý đánh giá)

#### Đánh giá từ khách hàng:
1. **Rating system**
   - Overall rating (1-5 sao)
   - Food rating
   - Service rating
   - Ambiance rating
   - Chi tiết rating từng món ăn

2. **Feedback collection**
   - Comment text
   - Anonymous option
   - Sentiment analysis tự động
   - Photo upload (optional)

#### Quản lý feedback (Manager):
1. **View và response**
   - Xem tất cả đánh giá
   - Filter theo rating và thời gian
   - Phản hồi đánh giá khách hàng
   - Track response rate

2. **Analytics**
   - Average rating trends
   - Most praised/criticized dishes
   - Service quality metrics
   - Customer satisfaction reports

---

### L. ANALYTICS & REPORTING (Phân tích & Báo cáo)

#### Dashboard tổng quan:
1. **KPI metrics**
   - Doanh thu hôm nay/tuần/tháng
   - Số đơn hàng và khách hàng
   - Average order value
   - Table turnover rate

2. **Real-time data**
   - Đơn hàng đang xử lý
   - Bàn đang sử dụng
   - Staff performance
   - Payment status

#### Báo cáo chi tiết:
1. **Revenue reports**
   - Daily/weekly/monthly revenue
   - Revenue by branch
   - Revenue by menu item
   - Payment method analysis

2. **Menu performance**
   - Best-selling items
   - Low-performing items
   - Profit margin analysis
   - Customization popularity

3. **Customer analytics**
   - Peak hours analysis
   - Customer behavior patterns
   - Repeat customer rate
   - Average dining time

4. **Staff performance**
   - Order processing time
   - Customer service ratings
   - Productivity metrics
   - Training needs analysis

#### Export capabilities:
- Excel/PDF export
- Scheduled email reports
- API access for third-party tools
- Custom date range selection

---

### M. NOTIFICATION SYSTEM (Hệ thống thông báo)

#### Real-time notifications:
1. **Order notifications**
   - New order cho staff
   - Order status updates cho customer
   - Payment confirmations
   - Cancellation alerts

2. **Service notifications**
   - Service requests cho staff
   - Table status changes
   - Reservation reminders
   - Feedback alerts

3. **System notifications**
   - Subscription expiry warnings
   - Feature limit alerts
   - Security notifications
   - System maintenance notices

#### Delivery channels:
- In-app notifications
- Email notifications
- SMS notifications (premium)
- Push notifications (mobile app)

---

## 🔄 LUỒNG HOẠT ĐỘNG CHÍNH

### 1. Customer Journey (Hành trình khách hàng):
```
Quét QR → Xem Menu → Chọn món → Customization → 
Đặt món → Thanh toán → Theo dõi đơn → Nhận món → 
Đánh giá → Hoàn thành
```

### 2. Staff Workflow (Quy trình nhân viên):
```
Nhận đơn → Xác nhận → Chuyển bếp → Theo dõi → 
Phục vụ → Xử lý yêu cầu → Thu dọn → Cập nhật trạng thái bàn
```

### 3. Manager Workflow (Quy trình quản lý):
```
Quản lý menu → Thiết lập bàn → Giám sát đơn hàng → 
Xử lý đặt bàn → Quản lý nhân viên → Xem báo cáo → 
Phản hồi feedback
```

### 4. Owner Workflow (Quy trình chủ nhà hàng):
```
Tạo chi nhánh → Thiết lập hệ thống → Quản lý subscription → 
Xem analytics → Quản lý tài chính → Mở rộng kinh doanh
```

---

## 📊 TÍCH HỢP HỆ THỐNG

### External Services:
- **PayOS**: Payment gateway
- **Email Service**: Transactional emails
- **Cloud Storage**: Image uploads
- **SMS Service**: Notifications
- **Analytics**: Google Analytics integration

### Database Relations:
- **Multi-tenant**: Isolation theo restaurant_id
- **Hierarchical**: Restaurant → Branch → Table → Order
- **Audit Trail**: Activity logs cho mọi thay đổi
- **Soft Delete**: Preserve data integrity

---

## 🎯 BUSINESS RULES

### Validation Rules:
- Email phải unique trong hệ thống
- Table number unique trong branch
- Order chỉ có thể cancel khi status = PENDING
- Payment amount phải match order total
- Subscription limits được enforce strict

### Security Rules:
- JWT token expiry và refresh mechanism
- Role-based access control
- API rate limiting
- Input validation và sanitization
- SQL injection prevention

### Business Logic:
- Automatic table status management
- Real-time inventory tracking
- Dynamic pricing với customization
- Multi-currency support (future)
- Tax calculation theo địa phương

---

---

## 📝 CHI TIẾT CÁC USE CASE

### 🔐 AUTHENTICATION USE CASES

#### AUTH-101: RegisterRestaurantUseCase (5 SP)
**Mô tả**: Đăng ký nhà hàng mới với tài khoản Owner
**Actor**: Restaurant Owner
**Preconditions**: Không có
**Flow**:
1. Owner nhập thông tin cá nhân (tên, email, phone, password)
2. Owner nhập thông tin nhà hàng (tên, địa chỉ, loại hình)
3. Hệ thống validate email chưa tồn tại
4. Hệ thống hash password
5. Tạo transaction database:
   - Tạo restaurant record
   - Tạo user record với role OWNER
   - Tạo branch mặc định
   - Tạo subscription cơ bản
6. Generate email verification token
7. Gửi email xác thực
8. Trả về thông tin đăng ký thành công
**Postconditions**: Restaurant và Owner account được tạo, email verification pending
**Exception**: Email đã tồn tại, validation error, database error

#### AUTH-102: LoginUseCase (3 SP)
**Mô tả**: Đăng nhập với email/password
**Actor**: User (Owner/Manager/Staff)
**Preconditions**: Tài khoản đã được tạo
**Flow**:
1. User nhập email và password
2. Hệ thống validate format email/password
3. Tìm user theo email
4. So sánh password với hash trong database
5. Kiểm tra trạng thái account (active/inactive)
6. Generate JWT access token (15 phút)
7. Generate refresh token (7 ngày)
8. Lưu refresh token vào Redis
9. Cập nhật last_login_at
10. Trả về tokens và user info
**Postconditions**: User đăng nhập thành công, session được tạo
**Exception**: Email không tồn tại, password sai, account bị khóa

#### AUTH-103: RefreshTokenUseCase (3 SP)
**Mô tả**: Làm mới access token khi hết hạn
**Actor**: Client Application
**Preconditions**: Có refresh token hợp lệ
**Flow**:
1. Client gửi refresh token
2. Hệ thống verify refresh token
3. Kiểm tra token trong Redis
4. Validate user vẫn active
5. Generate access token mới
6. Optionally rotate refresh token
7. Cập nhật Redis với token mới
8. Trả về access token mới
**Postconditions**: Access token mới được tạo
**Exception**: Refresh token invalid/expired, user inactive

#### AUTH-104: LogoutUseCase (2 SP)
**Mô tả**: Đăng xuất và invalidate tokens
**Actor**: User
**Preconditions**: User đã đăng nhập
**Flow**:
1. Client gửi logout request với tokens
2. Hệ thống verify access token
3. Xóa refresh token khỏi Redis
4. Blacklist access token (optional)
5. Ghi log logout activity
6. Trả về logout success
**Postconditions**: Session bị hủy, tokens invalid
**Exception**: Token already invalid

#### AUTH-105: ForgotPasswordUseCase (3 SP)
**Mô tả**: Gửi email reset password
**Actor**: User
**Preconditions**: Không có
**Flow**:
1. User nhập email
2. Hệ thống validate email format
3. Tìm user theo email
4. Generate reset token (1 giờ expire)
5. Lưu token vào database
6. Gửi email với reset link
7. Trả về success message
**Postconditions**: Reset token được tạo và gửi email
**Exception**: Email không tồn tại, email service error

#### AUTH-106: ResetPasswordUseCase (3 SP)
**Mô tả**: Reset password với token từ email
**Actor**: User
**Preconditions**: Có reset token hợp lệ
**Flow**:
1. User nhập token và password mới
2. Hệ thống validate token
3. Kiểm tra token chưa expire
4. Validate password strength
5. Hash password mới
6. Cập nhật password trong database
7. Xóa reset token
8. Gửi email confirmation
9. Trả về success
**Postconditions**: Password được đổi, reset token invalid
**Exception**: Token invalid/expired, weak password

#### AUTH-107: ChangePasswordUseCase (2 SP)
**Mô tả**: Đổi password khi đã đăng nhập
**Actor**: User
**Preconditions**: User đã đăng nhập
**Flow**:
1. User nhập password cũ và mới
2. Hệ thống verify access token
3. Validate password cũ
4. Validate password mới (strength)
5. Hash password mới
6. Cập nhật database
7. Ghi log activity
8. Trả về success
**Postconditions**: Password được thay đổi
**Exception**: Password cũ sai, password mới yếu

#### AUTH-108: VerifyEmailUseCase (3 SP)
**Mô tả**: Xác thực email sau đăng ký
**Actor**: User
**Preconditions**: Có verification token
**Flow**:
1. User click link trong email
2. Hệ thống extract token từ URL
3. Validate token format
4. Tìm token trong database
5. Kiểm tra token chưa expire
6. Cập nhật email_verified = true
7. Xóa verification token
8. Ghi log activity
9. Redirect đến login page
**Postconditions**: Email được verify
**Exception**: Token invalid/expired

---

### 🍽️ ORDER USE CASES

#### ORDER-101: CreateOrderUseCase (8 SP)
**Mô tả**: Tạo đơn hàng từ QR code
**Actor**: Customer
**Preconditions**: QR code hợp lệ, table available
**Flow**:
1. Customer quét QR code
2. Hệ thống decode QR token
3. Validate table và branch
4. Kiểm tra table status (AVAILABLE/OCCUPIED)
5. Tạo order session
6. Customer chọn món từ menu
7. Chọn customization options
8. Nhập số lượng và ghi chú
9. Tính toán pricing:
   - Base price × quantity
   - Customization price deltas
   - Subtotal calculation
10. Tạo order record với status PENDING
11. Tạo order_items records
12. Tạo order_item_customizations records
13. Cập nhật table status = OCCUPIED
14. Gửi notification cho staff
15. Trả về order details
**Postconditions**: Order được tạo, table occupied, staff được thông báo
**Exception**: QR invalid, table unavailable, menu item unavailable

#### ORDER-102: GetOrderDetailsUseCase (3 SP)
**Mô tả**: Xem chi tiết đơn hàng
**Actor**: Customer, Staff
**Preconditions**: Order tồn tại
**Flow**:
1. Request với order_id
2. Hệ thống validate order_id
3. Kiểm tra permission (customer chỉ xem order của mình)
4. Load order với related data:
   - Order items
   - Customizations
   - Payment info
   - Status history
5. Format response data
6. Trả về order details
**Postconditions**: Order details được trả về
**Exception**: Order không tồn tại, không có quyền truy cập

#### ORDER-103: UpdateOrderStatusUseCase (5 SP)
**Mô tả**: Cập nhật trạng thái đơn hàng
**Actor**: Staff, Manager
**Preconditions**: Order tồn tại, user có quyền
**Flow**:
1. Staff chọn order và status mới
2. Hệ thống validate transition hợp lệ:
   - PENDING → CONFIRMED
   - CONFIRMED → PREPARING
   - PREPARING → READY
   - READY → SERVED
   - SERVED → COMPLETED
3. Kiểm tra business rules
4. Cập nhật order status
5. Ghi activity log
6. Gửi notification cho customer
7. Cập nhật table status nếu cần
8. Trả về updated order
**Postconditions**: Order status updated, notifications sent
**Exception**: Invalid status transition, permission denied

#### ORDER-104: AddItemsToOrderUseCase (5 SP)
**Mô tả**: Thêm món vào đơn đang mở
**Actor**: Customer
**Preconditions**: Order status = PENDING hoặc CONFIRMED
**Flow**:
1. Customer chọn món mới
2. Hệ thống validate order có thể modify
3. Validate menu item availability
4. Chọn customizations
5. Tính toán pricing
6. Tạo order_item mới
7. Tạo customization records
8. Cập nhật order totals
9. Ghi activity log
10. Gửi notification cho staff
11. Trả về updated order
**Postconditions**: Món mới được thêm, totals updated
**Exception**: Order không thể modify, item unavailable

#### ORDER-105: RemoveItemFromOrderUseCase (3 SP)
**Mô tả**: Xóa món khỏi đơn hàng
**Actor**: Customer
**Preconditions**: Order có thể modify, item tồn tại
**Flow**:
1. Customer chọn item để xóa
2. Validate order status cho phép modify
3. Validate item thuộc order
4. Soft delete order_item
5. Xóa customizations liên quan
6. Recalculate order totals
7. Ghi activity log
8. Trả về updated order
**Postconditions**: Item bị xóa, totals updated
**Exception**: Cannot modify order, item not found

#### ORDER-106: UpdateOrderItemUseCase (3 SP)
**Mô tả**: Cập nhật số lượng món trong đơn
**Actor**: Customer
**Preconditions**: Order có thể modify
**Flow**:
1. Customer thay đổi quantity
2. Validate new quantity > 0
3. Validate order status
4. Cập nhật order_item quantity
5. Recalculate subtotal
6. Update order totals
7. Ghi activity log
8. Trả về updated item
**Postconditions**: Quantity và totals updated
**Exception**: Invalid quantity, cannot modify

#### ORDER-107: CancelOrderUseCase (5 SP)
**Mô tả**: Hủy đơn hàng
**Actor**: Customer, Staff
**Preconditions**: Order có thể cancel
**Flow**:
1. Request cancel với lý do
2. Validate order status (chỉ PENDING/CONFIRMED)
3. Kiểm tra business rules
4. Cập nhật status = CANCELLED
5. Ghi cancellation_reason
6. Process refund nếu đã thanh toán
7. Cập nhật table status = AVAILABLE
8. Gửi notifications
9. Ghi activity log
10. Trả về cancellation confirmation
**Postconditions**: Order cancelled, table available, refund processed
**Exception**: Cannot cancel, refund failed

#### ORDER-108: GetActiveOrdersByBranchUseCase (3 SP)
**Mô tả**: Danh sách đơn đang hoạt động theo chi nhánh
**Actor**: Staff, Manager
**Preconditions**: User thuộc branch
**Flow**:
1. Request với branch_id
2. Validate user permission
3. Query orders với status active:
   - PENDING, CONFIRMED, PREPARING, READY, SERVED
4. Load related data (items, table info)
5. Sort theo created_at
6. Apply pagination
7. Trả về order list
**Postconditions**: Active orders list returned
**Exception**: Permission denied

#### ORDER-109: GetOrdersByTableUseCase (3 SP)
**Mô tả**: Lịch sử đơn hàng theo bàn
**Actor**: Staff, Manager
**Preconditions**: Table tồn tại
**Flow**:
1. Request với table_id
2. Validate table thuộc branch của user
3. Query orders theo table
4. Apply date range filter
5. Load order summaries
6. Sort theo thời gian
7. Trả về order history
**Postconditions**: Table order history returned
**Exception**: Table not found, permission denied

#### ORDER-110: GetOrderLifecycleUseCase (5 SP)
**Mô tả**: Xem lịch sử thay đổi đơn hàng
**Actor**: Staff, Manager
**Preconditions**: Order tồn tại
**Flow**:
1. Request với order_id
2. Validate permission
3. Query activity_logs cho order
4. Load user info cho mỗi activity
5. Format timeline data
6. Include status changes, modifications
7. Sort theo timestamp
8. Trả về lifecycle timeline
**Postconditions**: Order lifecycle returned
**Exception**: Order not found, permission denied

---

### 🏢 BRANCH USE CASES

#### BRANCH-101: CreateBranchUseCase (5 SP)
**Mô tả**: Tạo chi nhánh mới
**Actor**: Owner, Manager
**Preconditions**: Subscription cho phép thêm branch
**Flow**:
1. User nhập thông tin chi nhánh
2. Validate subscription limits
3. Validate unique slug
4. Tạo branch record
5. Tạo default area "Main Hall"
6. Setup default theme
7. Generate QR codes cho sample tables
8. Ghi activity log
9. Trả về branch info
**Postconditions**: Branch created với default setup
**Exception**: Subscription limit exceeded, slug exists

#### BRANCH-102: UpdateBranchUseCase (3 SP)
**Mô tả**: Cập nhật thông tin chi nhánh
**Actor**: Owner, Manager
**Preconditions**: Branch tồn tại, có quyền
**Flow**:
1. User cập nhật thông tin
2. Validate permissions
3. Validate unique constraints
4. Update branch record
5. Handle logo/banner upload
6. Update SEO settings
7. Ghi activity log
8. Trả về updated branch
**Postconditions**: Branch info updated
**Exception**: Permission denied, validation failed

---

### 🪑 TABLE USE CASES

#### TABLE-101: CreateAreaUseCase (3 SP)
**Mô tả**: Tạo khu vực mới trong chi nhánh
**Actor**: Manager, Staff
**Preconditions**: Branch tồn tại
**Flow**:
1. User nhập tên khu vực
2. Validate branch permission
3. Set sort_order tự động
4. Tạo area record
5. Ghi activity log
6. Trả về area info
**Postconditions**: Area created
**Exception**: Permission denied, duplicate name

#### TABLE-102: UpdateAreaUseCase (2 SP)
**Mô tả**: Cập nhật thông tin khu vực
**Actor**: Manager, Staff
**Preconditions**: Area tồn tại
**Flow**:
1. User cập nhật tên/sort_order
2. Validate permissions
3. Update area record
4. Ghi activity log
5. Trả về updated area
**Postconditions**: Area updated
**Exception**: Permission denied

#### TABLE-103: DeleteAreaUseCase (3 SP)
**Mô tả**: Xóa khu vực (soft delete)
**Actor**: Manager
**Preconditions**: Area không có bàn active
**Flow**:
1. Validate area có thể xóa
2. Kiểm tra tables trong area
3. Soft delete area
4. Update related tables
5. Ghi activity log
6. Trả về success
**Postconditions**: Area deleted
**Exception**: Area has active tables

#### TABLE-104: CreateTableUseCase (5 SP)
**Mô tả**: Tạo bàn mới trong khu vực
**Actor**: Manager, Staff
**Preconditions**: Area tồn tại, subscription limits
**Flow**:
1. User nhập table info
2. Validate subscription limits
3. Validate unique table_number trong branch
4. Generate unique QR token
5. Tạo table record
6. Generate QR code image
7. Upload QR code to storage
8. Ghi activity log
9. Trả về table với QR info
**Postconditions**: Table created với QR code
**Exception**: Limit exceeded, duplicate table number

#### TABLE-105: UpdateTableUseCase (3 SP)
**Mô tả**: Cập nhật thông tin bàn
**Actor**: Manager, Staff
**Preconditions**: Table tồn tại
**Flow**:
1. User cập nhật table info
2. Validate permissions
3. Handle table_number change
4. Regenerate QR nếu cần
5. Update table record
6. Ghi activity log
7. Trả về updated table
**Postconditions**: Table updated
**Exception**: Permission denied, duplicate number

#### TABLE-106: DeleteTableUseCase (3 SP)
**Mô tả**: Xóa bàn (soft delete)
**Actor**: Manager
**Preconditions**: Table không có order active
**Flow**:
1. Validate table có thể xóa
2. Kiểm tra active orders
3. Soft delete table
4. Cleanup QR code files
5. Ghi activity log
6. Trả về success
**Postconditions**: Table deleted
**Exception**: Table has active orders

---

### 🍴 MENU USE CASES

#### MENU-101: CreateCategoryUseCase (3 SP)
**Mô tả**: Tạo danh mục món ăn
**Actor**: Manager
**Preconditions**: Branch tồn tại
**Flow**:
1. User nhập category info
2. Validate branch permission
3. Set sort_order tự động
4. Tạo category record
5. Ghi activity log
6. Trả về category info
**Postconditions**: Category created
**Exception**: Permission denied, duplicate name

#### MENU-102: UpdateCategoryUseCase (2 SP)
**Mô tả**: Cập nhật danh mục món ăn
**Actor**: Manager
**Preconditions**: Category tồn tại
**Flow**:
1. User cập nhật category info
2. Validate permissions
3. Update category record
4. Ghi activity log
5. Trả về updated category
**Postconditions**: Category updated
**Exception**: Permission denied

#### MENU-103: DeleteCategoryUseCase (2 SP)
**Mô tả**: Xóa danh mục (soft delete)
**Actor**: Manager
**Preconditions**: Category không có menu items
**Flow**:
1. Validate category có thể xóa
2. Kiểm tra menu items
3. Soft delete category
4. Ghi activity log
5. Trả về success
**Postconditions**: Category deleted
**Exception**: Category has menu items

#### MENU-104: CreateMenuItemUseCase (5 SP)
**Mô tả**: Tạo món ăn mới
**Actor**: Manager
**Preconditions**: Category tồn tại, subscription limits
**Flow**:
1. User nhập menu item info
2. Validate subscription limits
3. Validate category exists
4. Handle image upload
5. Tạo menu_item record
6. Setup customization groups nếu có
7. Ghi activity log
8. Trả về menu item info
**Postconditions**: Menu item created
**Exception**: Limit exceeded, category not found

#### MENU-105: UpdateMenuItemUseCase (3 SP)
**Mô tả**: Cập nhật thông tin món ăn
**Actor**: Manager
**Preconditions**: Menu item tồn tại
**Flow**:
1. User cập nhật item info
2. Validate permissions
3. Handle image updates
4. Update menu_item record
5. Update customizations nếu có
6. Ghi activity log
7. Trả về updated item
**Postconditions**: Menu item updated
**Exception**: Permission denied

#### MENU-106: DeleteMenuItemUseCase (2 SP)
**Mô tả**: Xóa món ăn (soft delete)
**Actor**: Manager
**Preconditions**: Item không trong active orders
**Flow**:
1. Validate item có thể xóa
2. Kiểm tra active orders
3. Soft delete menu_item
4. Cleanup images
5. Ghi activity log
6. Trả về success
**Postconditions**: Menu item deleted
**Exception**: Item in active orders

#### MENU-107: UploadMenuItemImageUseCase (5 SP)
**Mô tả**: Upload hình ảnh cho món ăn
**Actor**: Manager
**Preconditions**: Menu item tồn tại
**Flow**:
1. User upload image file
2. Validate file format/size
3. Resize và optimize image
4. Upload to cloud storage
5. Update menu_item image_url
6. Cleanup old images
7. Ghi activity log
8. Trả về image URL
**Postconditions**: Image uploaded và linked
**Exception**: Invalid file, upload failed

#### MENU-108: GetFullMenuByBranchUseCase (5 SP)
**Mô tả**: Lấy menu đầy đủ theo chi nhánh
**Actor**: Customer, Staff
**Preconditions**: Branch tồn tại
**Flow**:
1. Request với branch_id
2. Validate branch exists
3. Query categories với sort_order
4. Query menu_items cho mỗi category
5. Load customization options
6. Filter available items only
7. Format menu structure
8. Cache result
9. Trả về full menu
**Postconditions**: Complete menu returned
**Exception**: Branch not found

#### MENU-109: UpdateMenuItemAvailabilityUseCase (3 SP)
**Mô tả**: Cập nhật tình trạng món (hết hàng/còn hàng)
**Actor**: Manager, Staff
**Preconditions**: Menu item tồn tại
**Flow**:
1. User toggle availability
2. Validate permissions
3. Update available field
4. Ghi activity log
5. Invalidate menu cache
6. Notify active customers nếu cần
7. Trả về updated status
**Postconditions**: Availability updated
**Exception**: Permission denied

---

### 📅 RESERVATION USE CASES

#### RESERVATION-101: CreateReservationUseCase (5 SP)
**Mô tả**: Tạo đặt bàn mới
**Actor**: Customer
**Preconditions**: Branch mở cửa, có bàn trống
**Flow**:
1. Customer chọn branch, date, time
2. Nhập party_size và contact info
3. Validate operating hours
4. Check table availability
5. Calculate suitable tables
6. Tạo reservation record
7. Send confirmation email/SMS
8. Ghi activity log
9. Trả về reservation details
**Postconditions**: Reservation created, confirmation sent
**Exception**: No tables available, invalid time

#### RESERVATION-102: UpdateReservationUseCase (3 SP)
**Mô tả**: Cập nhật thông tin đặt bàn
**Actor**: Customer, Staff
**Preconditions**: Reservation tồn tại, chưa quá hạn
**Flow**:
1. User cập nhật reservation info
2. Validate permissions
3. Check new time availability nếu thay đổi
4. Update reservation record
5. Send update notification
6. Ghi activity log
7. Trả về updated reservation
**Postconditions**: Reservation updated
**Exception**: Permission denied, time unavailable

#### RESERVATION-103: CancelReservationUseCase (3 SP)
**Mô tả**: Hủy đặt bàn
**Actor**: Customer, Staff
**Preconditions**: Reservation có thể hủy
**Flow**:
1. Request cancel với lý do
2. Validate cancellation policy
3. Update status = CANCELLED
4. Free up table slot
5. Send cancellation notification
6. Ghi activity log
7. Trả về cancellation confirmation
**Postconditions**: Reservation cancelled
**Exception**: Cannot cancel (too late)

#### RESERVATION-104: ConfirmReservationUseCase (2 SP)
**Mô tả**: Xác nhận đặt bàn (Staff)
**Actor**: Staff
**Preconditions**: Reservation status = PENDING
**Flow**:
1. Staff review reservation
2. Assign specific table
3. Update status = CONFIRMED
4. Send confirmation to customer
5. Ghi activity log
6. Trả về confirmed reservation
**Postconditions**: Reservation confirmed với table
**Exception**: No suitable tables

#### RESERVATION-105: GetReservationDetailsUseCase (2 SP)
**Mô tả**: Xem chi tiết đặt bàn
**Actor**: Customer, Staff
**Preconditions**: Reservation tồn tại
**Flow**:
1. Request với reservation_id
2. Validate permissions
3. Load reservation với related data
4. Format response
5. Trả về reservation details
**Postconditions**: Reservation details returned
**Exception**: Not found, permission denied

#### RESERVATION-106: ListReservationsUseCase (3 SP)
**Mô tả**: Danh sách đặt bàn
**Actor**: Staff, Manager
**Preconditions**: User thuộc branch
**Flow**:
1. Request với filters (date, status)
2. Validate branch permission
3. Query reservations
4. Apply pagination
5. Load customer info
6. Sort theo reservation_date
7. Trả về reservation list
**Postconditions**: Reservation list returned
**Exception**: Permission denied

#### RESERVATION-107: CheckTableAvailabilityUseCase (3 SP)
**Mô tả**: Kiểm tra bàn trống
**Actor**: Customer, Staff
**Preconditions**: Branch và time hợp lệ
**Flow**:
1. Request với branch, date, time, party_size
2. Validate operating hours
3. Query existing reservations
4. Query table capacities
5. Calculate available tables
6. Consider buffer time
7. Trả về availability info
**Postconditions**: Availability info returned
**Exception**: Invalid parameters

---

### 🔔 SERVICE REQUEST USE CASES

#### SERVICE-101: CreateServiceRequestUseCase (3 SP)
**Mô tả**: Tạo yêu cầu phục vụ từ khách hàng
**Actor**: Customer
**Preconditions**: Customer đang ngồi tại bàn
**Flow**:
1. Customer chọn loại yêu cầu (water, clean table, assistance, bill)
2. Nhập ghi chú chi tiết
3. Hệ thống xác định table từ session
4. Tạo service_request record
5. Gửi real-time notification cho staff
6. Ghi activity log
7. Trả về request confirmation
**Postconditions**: Service request created, staff notified
**Exception**: Invalid table session

---

Đây là mô tả chi tiết và đầy đủ các use case của hệ thống FoodStack QR Service. Bạn có thể sử dụng thông tin này để vẽ các diagram như Activity Diagram, Sequence Diagram, State Diagram, Class Diagram và Integrated Communication Diagram.
Sử dụng cho các diagram:
Activity Diagram: Sử dụng Flow của mỗi use case
Sequence Diagram: Sử dụng tương tác giữa Actor và System
State Diagram: Sử dụng các trạng thái trong Order, Reservation, Table
Class Diagram: Sử dụng entities và relationships từ database
Communication Diagram: Sử dụng message flow giữa các components