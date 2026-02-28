# 📝 HƯỚNG DẪN NHẬP TAY STORIES VÀO JIRA

**Mục tiêu:** Tạo 76 Stories cho 9 Sprints  
**Thời gian:** ~2-3 giờ  
**Phương pháp:** Copy/Paste từ file này vào Jira

---

## 🎯 CHUẨN BỊ

### Bước 1: Tạo 14 Epics trước

Trước khi tạo Stories, cần có đầy đủ Epics. Tạo nhanh:

**Click "Create" → Chọn "Epic"**

1. **AUTH-001** - User Authentication
2. **REST-001** - Restaurant Management  
3. **BRANCH-001** - Branch Management
4. **TABLE-001** - Table & Area Management
5. **MENU-001** - Menu Management
6. **ORDER-001** - Order Management
7. **PAYMENT-001** - Payment Management
8. **USER-001** - User & Staff Management
9. **SERVICE-001** - Service Request
10. **RESERVATION-001** - Reservation Management
11. **SUBSCRIPTION-001** - Subscription Management
12. **ANALYTICS-001** - Analytics & Reporting
13. **NOTIFICATION-001** - Notification System
14. **FEEDBACK-001** - Feedback & Rating

---

## 🚀 SPRINT 1 - AUTHENTICATION (8 Stories, 24 SP)

### ✅ Story 1: AUTH-101

**Click "Create" → Chọn "Story"**

```
Summary:
AUTH-101 - Register Restaurant

Parent:
AUTH-001 - User Authentication

Description:
Use Case: RegisterRestaurantUseCase

Mô tả: Cho phép Owner đăng ký nhà hàng mới với email verification

Acceptance Criteria:
- Owner có thể đăng ký với email/password
- Validate unique email và business information
- Tạo restaurant entity trong database
- Tạo owner user account
- Gửi email verification
- Redirect đến verification page

Effort: 5 SP
Dependencies: None

Priority: Highest

Labels: auth, registration, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 2: AUTH-102

```
Summary:
AUTH-102 - Login

Parent:
AUTH-001 - User Authentication

Description:
Use Case: LoginUseCase

Mô tả: Implement secure login với email/password. Generate JWT tokens.

Acceptance Criteria:
- User có thể login với email/password
- Validate credentials
- Generate JWT access token (15min expiry)
- Generate refresh token (30 days expiry)
- Store refresh token trong Redis
- Log authentication events
- Return tokens và user info

Effort: 3 SP
Dependencies: AUTH-101

Priority: Highest

Labels: auth, jwt, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 3: AUTH-103

```
Summary:
AUTH-103 - Refresh Token

Parent:
AUTH-001 - User Authentication

Description:
Use Case: RefreshTokenUseCase

Mô tả: Implement token refresh mechanism

Acceptance Criteria:
- Validate refresh token từ Redis
- Generate new access token
- Handle token rotation
- Blacklist old tokens
- Return new access token
- Log refresh events

Effort: 3 SP
Dependencies: AUTH-102

Priority: Highest

Labels: auth, jwt, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 4: AUTH-104

```
Summary:
AUTH-104 - Logout

Parent:
AUTH-001 - User Authentication

Description:
Use Case: LogoutUseCase

Mô tả: Implement logout functionality

Acceptance Criteria:
- Invalidate refresh token trong Redis
- Add access token to blacklist
- Clear user session
- Log logout event
- Return success response

Effort: 2 SP
Dependencies: AUTH-102

Priority: High

Labels: auth, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 5: AUTH-105

```
Summary:
AUTH-105 - Forgot Password

Parent:
AUTH-001 - User Authentication

Description:
Use Case: ForgotPasswordUseCase

Mô tả: Implement forgot password flow

Acceptance Criteria:
- User nhập email
- Validate email exists
- Generate secure reset token
- Store token với expiry (1 hour)
- Send email với reset link
- Return success message

Effort: 3 SP
Dependencies: None

Priority: High

Labels: auth, email, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 6: AUTH-106

```
Summary:
AUTH-106 - Reset Password

Parent:
AUTH-001 - User Authentication

Description:
Use Case: ResetPasswordUseCase

Mô tả: Implement password reset với token validation

Acceptance Criteria:
- Validate reset token
- Check token expiry
- Validate new password strength
- Hash password với bcrypt (12 rounds)
- Update password trong database
- Invalidate reset token
- Log password change event

Effort: 3 SP
Dependencies: AUTH-105

Priority: High

Labels: auth, security, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 7: AUTH-107

```
Summary:
AUTH-107 - Change Password

Parent:
AUTH-001 - User Authentication

Description:
Use Case: ChangePasswordUseCase

Mô tả: Implement password change cho authenticated users

Acceptance Criteria:
- User must be authenticated
- Verify old password
- Validate new password strength
- Hash new password với bcrypt
- Update password trong database
- Invalidate all existing tokens
- Log password change event

Effort: 2 SP
Dependencies: AUTH-102

Priority: Medium

Labels: auth, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 8: AUTH-108 (CUỐI SPRINT 1)

```
Summary:
AUTH-108 - Verify Email

Parent:
AUTH-001 - User Authentication

Description:
Use Case: VerifyEmailUseCase

Mô tả: Implement email verification sau registration

Acceptance Criteria:
- Validate verification token
- Check token expiry
- Update email_verified status
- Activate user account
- Log verification event
- Redirect to success page

Effort: 3 SP
Dependencies: AUTH-101

Priority: High

Labels: auth, email, backend
```

⚠️ **BỎ CHECK "Create another"** → Click **"Create"**

---

## 🟢 SPRINT 2 - RESTAURANT & BRANCH (9 Stories, 35 SP)

### ✅ Story 9: REST-101

**Click "Create" → Chọn "Story"**

```
Summary:
REST-101 - Create Restaurant

Parent:
REST-001 - Restaurant Management

Description:
Use Case: CreateRestaurantUseCase

Mô tả: Tạo nhà hàng mới với thông tin cơ bản

Acceptance Criteria:
- Owner có thể tạo restaurant
- Validate business information
- Upload logo (optional)
- Set default settings
- Create tenant context
- Return restaurant ID

Effort: 5 SP
Dependencies: AUTH-101

Priority: Highest

Labels: restaurant, tenant, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 10: REST-102

```
Summary:
REST-102 - Update Restaurant

Parent:
REST-001 - Restaurant Management

Description:
Use Case: UpdateRestaurantUseCase

Mô tả: Cập nhật thông tin nhà hàng

Acceptance Criteria:
- Owner có thể update restaurant info
- Validate changes
- Update logo if provided
- Log changes
- Return updated data

Effort: 3 SP
Dependencies: REST-101

Priority: High

Labels: restaurant, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 11: REST-103

```
Summary:
REST-103 - Get Restaurant Details

Parent:
REST-001 - Restaurant Management

Description:
Use Case: GetRestaurantDetailsUseCase

Mô tả: Xem chi tiết thông tin nhà hàng

Acceptance Criteria:
- Get restaurant by ID
- Include logo URL
- Include settings
- Return complete info

Effort: 2 SP
Dependencies: REST-101

Priority: High

Labels: restaurant, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 12: REST-104

```
Summary:
REST-104 - Upload Restaurant Logo

Parent:
REST-001 - Restaurant Management

Description:
Use Case: UploadRestaurantLogoUseCase

Mô tả: Upload và quản lý logo nhà hàng

Acceptance Criteria:
- Upload image file
- Validate file type (jpg, png)
- Resize and optimize
- Store in cloud storage
- Update restaurant logo URL
- Delete old logo

Effort: 3 SP
Dependencies: REST-101

Priority: Medium

Labels: restaurant, upload, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 13: BRANCH-101

```
Summary:
BRANCH-101 - Create Branch

Parent:
BRANCH-001 - Branch Management

Description:
Use Case: CreateBranchUseCase

Mô tả: Tạo chi nhánh mới cho nhà hàng

Acceptance Criteria:
- Owner có thể tạo branch
- Validate branch info (name, address, phone)
- Set operating hours
- Set default status (active)
- Link to restaurant
- Return branch ID

Effort: 5 SP
Dependencies: REST-101

Priority: Highest

Labels: branch, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 14: BRANCH-102

```
Summary:
BRANCH-102 - Update Branch

Parent:
BRANCH-001 - Branch Management

Description:
Use Case: UpdateBranchUseCase

Mô tả: Cập nhật thông tin chi nhánh

Acceptance Criteria:
- Manager có thể update branch info
- Validate changes
- Update operating hours
- Log changes
- Return updated data

Effort: 3 SP
Dependencies: BRANCH-101

Priority: High

Labels: branch, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 15: BRANCH-103

```
Summary:
BRANCH-103 - Get Branch Details

Parent:
BRANCH-001 - Branch Management

Description:
Use Case: GetBranchDetailsUseCase

Mô tả: Xem chi tiết thông tin chi nhánh

Acceptance Criteria:
- Get branch by ID
- Include operating hours
- Include current status
- Return complete info

Effort: 2 SP
Dependencies: BRANCH-101

Priority: High

Labels: branch, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 16: BRANCH-104

```
Summary:
BRANCH-104 - List Branches

Parent:
BRANCH-001 - Branch Management

Description:
Use Case: ListBranchesUseCase

Mô tả: Danh sách chi nhánh của nhà hàng

Acceptance Criteria:
- List all branches by restaurant
- Support pagination
- Filter by status
- Sort by name/created date
- Return branch list

Effort: 3 SP
Dependencies: BRANCH-101

Priority: High

Labels: branch, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 17: BRANCH-107 (CUỐI SPRINT 2)

```
Summary:
BRANCH-107 - Set Branch Status

Parent:
BRANCH-001 - Branch Management

Description:
Use Case: SetBranchStatusUseCase

Mô tả: Đóng/mở chi nhánh tạm thời

Acceptance Criteria:
- Manager có thể set status (active/inactive)
- Validate status change
- Notify affected orders
- Log status change
- Return updated status

Effort: 2 SP
Dependencies: BRANCH-101

Priority: Medium

Labels: branch, backend
```

⚠️ **BỎ CHECK "Create another"** → Click **"Create"**

---

## 🟢 SPRINT 3 - TABLE & QR SYSTEM (10 Stories, 30 SP)

### ✅ Story 18: TABLE-101

**Click "Create" → Chọn "Story"**

```
Summary:
TABLE-101 - Create Area

Parent:
TABLE-001 - Table & Area Management

Description:
Use Case: CreateAreaUseCase

Mô tả: Tạo khu vực trong chi nhánh (Main, VIP, Outdoor)

Acceptance Criteria:
- Manager có thể tạo area
- Validate area name unique trong branch
- Set display order
- Link to branch
- Return area ID

Effort: 3 SP
Dependencies: BRANCH-101

Priority: Highest

Labels: table, area, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 19: TABLE-102

```
Summary:
TABLE-102 - Update Area

Parent:
TABLE-001 - Table & Area Management

Description:
Use Case: UpdateAreaUseCase

Mô tả: Cập nhật thông tin khu vực

Acceptance Criteria:
- Manager có thể update area info
- Validate changes
- Update display order
- Log changes
- Return updated data

Effort: 2 SP
Dependencies: TABLE-101

Priority: Medium

Labels: table, area, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 20: TABLE-104

```
Summary:
TABLE-104 - Create Table

Parent:
TABLE-001 - Table & Area Management

Description:
Use Case: CreateTableUseCase

Mô tả: Tạo bàn mới với QR code tự động

Acceptance Criteria:
- Manager có thể tạo table
- Validate table number unique trong branch
- Auto-generate QR code
- Set capacity
- Link to area
- Set default status (available)
- Return table ID và QR code

Effort: 5 SP
Dependencies: TABLE-101

Priority: Highest

Labels: table, qr, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 21: TABLE-105

```
Summary:
TABLE-105 - Update Table

Parent:
TABLE-001 - Table & Area Management

Description:
Use Case: UpdateTableUseCase

Mô tả: Cập nhật thông tin bàn

Acceptance Criteria:
- Manager có thể update table info
- Validate changes
- Update capacity
- Move to different area
- Log changes
- Return updated data

Effort: 3 SP
Dependencies: TABLE-104

Priority: High

Labels: table, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 22: TABLE-107

```
Summary:
TABLE-107 - Generate Table QR

Parent:
TABLE-001 - Table & Area Management

Description:
Use Case: GenerateTableQRUseCase

Mô tả: Tạo/tái tạo QR code cho bàn

Acceptance Criteria:
- Generate unique QR code
- Encode table ID và branch ID
- Store QR image
- Return QR code URL
- Support regenerate (security)

Effort: 5 SP
Dependencies: TABLE-104

Priority: Highest

Labels: table, qr, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 23: TABLE-108

```
Summary:
TABLE-108 - Get Table by QR

Parent:
TABLE-001 - Table & Area Management

Description:
Use Case: GetTableByQRUseCase

Mô tả: Lấy thông tin bàn qua QR code scan

Acceptance Criteria:
- Decode QR code
- Validate QR code
- Get table info
- Get branch info
- Check table status
- Return table details

Effort: 3 SP
Dependencies: TABLE-107

Priority: Highest

Labels: table, qr, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 24: TABLE-109

```
Summary:
TABLE-109 - Update Table Status

Parent:
TABLE-001 - Table & Area Management

Description:
Use Case: UpdateTableStatusUseCase

Mô tả: Cập nhật trạng thái bàn (available, occupied, reserved, cleaning)

Acceptance Criteria:
- Staff có thể update status
- Validate status transition
- Update timestamp
- Notify relevant parties
- Log status change
- Return updated status

Effort: 3 SP
Dependencies: TABLE-104

Priority: Highest

Labels: table, status, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 25: TABLE-103

```
Summary:
TABLE-103 - Delete Area

Parent:
TABLE-001 - Table & Area Management

Description:
Use Case: DeleteAreaUseCase

Mô tả: Xóa khu vực (nếu không có bàn)

Acceptance Criteria:
- Manager có thể delete area
- Validate no tables in area
- Soft delete
- Log deletion
- Return success

Effort: 2 SP
Dependencies: TABLE-101

Priority: Low

Labels: table, area, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 26: TABLE-106

```
Summary:
TABLE-106 - Delete Table

Parent:
TABLE-001 - Table & Area Management

Description:
Use Case: DeleteTableUseCase

Mô tả: Xóa bàn (nếu không có order active)

Acceptance Criteria:
- Manager có thể delete table
- Validate no active orders
- Soft delete
- Invalidate QR code
- Log deletion
- Return success

Effort: 2 SP
Dependencies: TABLE-104

Priority: Medium

Labels: table, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 27: TABLE-110 (CUỐI SPRINT 3)

```
Summary:
TABLE-110 - Merge Tables

Parent:
TABLE-001 - Table & Area Management

Description:
Use Case: MergeTablesUseCase

Mô tả: Gộp nhiều bàn thành 1 (cho nhóm lớn hoặc split bill)

Acceptance Criteria:
- Staff có thể merge tables
- Validate tables in same branch
- Create merged table group
- Link orders to group
- Update table statuses
- Support unmerge
- Log merge action

Effort: 8 SP
Dependencies: TABLE-104, TABLE-109

Priority: High

Labels: table, advanced, backend
```

⚠️ **BỎ CHECK "Create another"** → Click **"Create"**

---

## 🟢 SPRINT 4 - MENU MANAGEMENT (11 Stories, 38 SP)

### ✅ Story 28: MENU-101

**Click "Create" → Chọn "Story"**

```
Summary:
MENU-101 - Create Category

Parent:
MENU-001 - Menu Management

Description:
Use Case: CreateCategoryUseCase

Mô tả: Tạo danh mục món ăn (Appetizers, Main Course, Desserts, Drinks)

Acceptance Criteria:
- Manager có thể tạo category
- Validate category name
- Set display order
- Link to branch
- Return category ID

Effort: 3 SP
Dependencies: BRANCH-101

Priority: Highest

Labels: menu, category, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 29: MENU-102

```
Summary:
MENU-102 - Update Category

Parent:
MENU-001 - Menu Management

Description:
Use Case: UpdateCategoryUseCase

Mô tả: Cập nhật thông tin danh mục

Acceptance Criteria:
- Manager có thể update category
- Validate changes
- Update display order
- Log changes
- Return updated data

Effort: 2 SP
Dependencies: MENU-101

Priority: Medium

Labels: menu, category, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 30: MENU-104

```
Summary:
MENU-104 - Create Menu Item

Parent:
MENU-001 - Menu Management

Description:
Use Case: CreateMenuItemUseCase

Mô tả: Tạo món ăn mới

Acceptance Criteria:
- Manager có thể tạo menu item
- Validate item info (name, price, description)
- Upload image (optional)
- Link to category
- Set availability
- Return item ID

Effort: 5 SP
Dependencies: MENU-101

Priority: Highest

Labels: menu, item, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 31: MENU-105

```
Summary:
MENU-105 - Update Menu Item

Parent:
MENU-001 - Menu Management

Description:
Use Case: UpdateMenuItemUseCase

Mô tả: Cập nhật thông tin món ăn

Acceptance Criteria:
- Manager có thể update item
- Validate changes
- Update price
- Update description
- Log changes
- Return updated data

Effort: 3 SP
Dependencies: MENU-104

Priority: High

Labels: menu, item, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 32: MENU-107

```
Summary:
MENU-107 - Upload Menu Item Image

Parent:
MENU-001 - Menu Management

Description:
Use Case: UploadMenuItemImageUseCase

Mô tả: Upload hình ảnh món ăn

Acceptance Criteria:
- Upload image file
- Validate file type
- Resize and optimize
- Store in cloud storage
- Update item image URL
- Delete old image

Effort: 5 SP
Dependencies: MENU-104

Priority: High

Labels: menu, upload, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 33: MENU-108

```
Summary:
MENU-108 - Get Full Menu by Branch

Parent:
MENU-001 - Menu Management

Description:
Use Case: GetFullMenuByBranchUseCase

Mô tả: Lấy menu đầy đủ theo chi nhánh (cho customer scan QR)

Acceptance Criteria:
- Get all categories by branch
- Get all items per category
- Include images
- Include prices
- Include availability
- Filter available items only
- Return structured menu

Effort: 5 SP
Dependencies: MENU-104

Priority: Highest

Labels: menu, customer, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 34: MENU-109

```
Summary:
MENU-109 - Update Menu Item Availability

Parent:
MENU-001 - Menu Management

Description:
Use Case: UpdateMenuItemAvailabilityUseCase

Mô tả: Cập nhật tình trạng món (available, out_of_stock)

Acceptance Criteria:
- Staff có thể update availability
- Validate status
- Update timestamp
- Notify customers (if viewing menu)
- Log change
- Return updated status

Effort: 3 SP
Dependencies: MENU-104

Priority: Highest

Labels: menu, availability, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 35: MENU-110

```
Summary:
MENU-110 - Create Customization Group

Parent:
MENU-001 - Menu Management

Description:
Use Case: CreateCustomizationGroupUseCase

Mô tả: Tạo nhóm tùy chọn (Size, Spicy Level, Toppings)

Acceptance Criteria:
- Manager có thể tạo customization group
- Set group name
- Set selection type (single/multiple)
- Set required/optional
- Link to menu items
- Return group ID

Effort: 5 SP
Dependencies: MENU-104

Priority: High

Labels: menu, customization, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 36: MENU-111

```
Summary:
MENU-111 - Add Customization Option

Parent:
MENU-001 - Menu Management

Description:
Use Case: AddCustomizationOptionUseCase

Mô tả: Thêm tùy chọn vào nhóm (Small/Medium/Large, Extra Cheese +10k)

Acceptance Criteria:
- Manager có thể add option
- Set option name
- Set price modifier
- Set display order
- Link to group
- Return option ID

Effort: 3 SP
Dependencies: MENU-110

Priority: High

Labels: menu, customization, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 37: MENU-106

```
Summary:
MENU-106 - Delete Menu Item

Parent:
MENU-001 - Menu Management

Description:
Use Case: DeleteMenuItemUseCase

Mô tả: Xóa món ăn

Acceptance Criteria:
- Manager có thể delete item
- Soft delete
- Keep in order history
- Log deletion
- Return success

Effort: 2 SP
Dependencies: MENU-104

Priority: Medium

Labels: menu, backend
```

✅ **Check "Create another"** → Click **"Create"**

---

### ✅ Story 38: MENU-103 (CUỐI SPRINT 4)

```
Summary:
MENU-103 - Delete Category

Parent:
MENU-001 - Menu Management

Description:
Use Case: DeleteCategoryUseCase

Mô tả: Xóa danh mục (nếu không có món)

Acceptance Criteria:
- Manager có thể delete category
- Validate no items in category
- Soft delete
- Log deletion
- Return success

Effort: 2 SP
Dependencies: MENU-101

Priority: Low

Labels: menu, category, backend
```

⚠️ **BỎ CHECK "Create another"** → Click **"Create"**

---

## 🎯 MVP CORE - TIẾP TỤC VỚI SPRINT 5-6

Bạn đã hoàn thành 4 sprints đầu (38 stories). Tiếp tục với Sprint 5-6 để hoàn thành MVP Core.

**Tổng tiến độ:**
- ✅ Sprint 1: 8 stories (24 SP)
- ✅ Sprint 2: 9 stories (35 SP)  
- ✅ Sprint 3: 10 stories (30 SP)
- ✅ Sprint 4: 11 stories (38 SP)
- ⏳ Sprint 5: 7 stories (30 SP) - TIẾP THEO
- ⏳ Sprint 6: 7 stories (34 SP)

**Còn lại:** 38 stories nữa để hoàn thành 76 stories

---

Bạn muốn tôi tiếp tục với Sprint 5-9 không? 🚀
