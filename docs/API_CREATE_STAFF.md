# API: Tạo Tài Khoản Nhân Viên (Create Staff)

## 📋 Thông Tin Chung

**Endpoint:** `POST /api/v1/staff`  
**Authentication:** Required (Bearer Token)  
**Authorization:** OWNER, MANAGER only  
**Story:** CreateStaffUseCase | Tạo tài khoản nhân viên

---

## 🎯 Mục Đích

Owner/Manager tạo tài khoản nhân viên trực tiếp trong chi nhánh với role cụ thể.

---

## 📥 Request

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Body
```json
{
  "name": "Nguyen Van A",
  "email": "staff1@gmail.com",
  "role": "WAITER",
  "branchId": "branch_123"
}
```

### Validation Rules
- `name`: String, 2-100 ký tự
- `email`: Email hợp lệ
- `role`: Enum ["WAITER", "CHEF", "CASHIER", "MANAGER"]
- `branchId`: UUID hợp lệ

---

## 📤 Response

### Success (201 Created)
```json
{
  "success": true,
  "message": "Staff account created successfully. Activation email has been sent.",
  "data": {
    "userId": "uuid-123",
    "email": "staff1@gmail.com",
    "name": "Nguyen Van A",
    "role": "WAITER",
    "branchId": "branch_123",
    "restaurantId": "restaurant_123",
    "status": "ACTIVE",
    "tempPassword": "Abc12345" // Chỉ hiển thị trong development mode
  }
}
```

### Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "path": ["email"],
      "message": "Invalid email format"
    }
  ]
}
```

#### 401 Unauthorized - Not Authenticated
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

#### 403 Forbidden - Not Owner/Manager
```json
{
  "success": false,
  "message": "Only Owner or Manager can create staff accounts"
}
```

#### 404 Not Found - Restaurant/Branch Not Found
```json
{
  "success": false,
  "message": "Restaurant not found"
}
```

#### 409 Conflict - Email Already Exists
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

## 🔄 Luồng Xử Lý (Business Flow)

### 1. Authentication & Authorization
```
Client Request → Auth Middleware → Verify JWT Token
                                 → Check Token Blacklist
                                 → Check Token Version
                                 → Extract User Info (userId, role, restaurantId)
```

### 2. Validation Layer
```
Request Body → Zod Schema Validation
            → Check: name (2-100 chars)
            → Check: email (valid format)
            → Check: role (WAITER|CHEF|CASHIER|MANAGER)
            → Check: branchId (UUID format)
```

### 3. Business Logic (Use Case)
```
Step 1: Validate Current User Role
        ├─ Check: role === 'OWNER' || role === 'MANAGER'
        └─ Throw UnauthorizedError if not

Step 2: Validate Restaurant Exists
        ├─ Query: restaurants.findById(currentUser.restaurantId)
        └─ Throw ValidationError if not found

Step 3: Validate Branch Exists & Belongs to Restaurant
        ├─ Query: branches.findById(dto.branchId)
        ├─ Check: branch.restaurant_id === currentUser.restaurantId
        └─ Throw ValidationError/UnauthorizedError if invalid

Step 4: Validate Email Uniqueness
        ├─ Query: users.findByEmail(dto.email)
        └─ Throw ValidationError if exists

Step 5: Generate Temporary Password
        ├─ Generate: 8-character random password
        │   (A-Z, a-z, 2-9, !@#$%)
        └─ Hash: bcrypt with salt rounds 12

Step 6: Create Staff Account (Transaction)
        ├─ Begin Transaction
        ├─ Insert: users table
        │   ├─ id: UUID
        │   ├─ restaurant_id: currentUser.restaurantId
        │   ├─ branch_id: dto.branchId
        │   ├─ email: dto.email
        │   ├─ password_hash: hashed password
        │   ├─ full_name: dto.name
        │   ├─ role: dto.role
        │   └─ status: 'ACTIVE'
        └─ Commit Transaction

Step 7: Send Activation Email (Async)
        ├─ Email To: dto.email
        ├─ Subject: "Welcome to {restaurant.name}"
        ├─ Content: Temporary password
        └─ Note: Non-blocking (catch errors)

Step 8: Return Response
        └─ Return: userId, email, name, role, branchId, restaurantId, status
```

---

## 🧪 Test với Postman

### Bước 1: Login để lấy Access Token

**Request:**
```
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "owner@restaurant.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "...",
    "user": {
      "id": "user_123",
      "role": "OWNER",
      "restaurantId": "restaurant_123"
    }
  }
}
```

**Lưu ý:** Copy `accessToken` để dùng cho bước tiếp theo.

---

### Bước 2: Lấy Branch ID

**Request:**
```
GET http://localhost:3000/api/v1/restaurants/restaurant_123
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurant": {
      "id": "restaurant_123",
      "name": "My Restaurant"
    },
    "branches": [
      {
        "id": "branch_456",
        "name": "Main Branch"
      }
    ]
  }
}
```

**Lưu ý:** Copy `branch_id` để dùng cho bước tiếp theo.

---

### Bước 3: Tạo Staff Account

**Request:**
```
POST http://localhost:3000/api/v1/staff
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Nguyen Van A",
  "email": "waiter1@gmail.com",
  "role": "WAITER",
  "branchId": "branch_456"
}
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "Staff account created successfully. Activation email has been sent.",
  "data": {
    "userId": "new_user_uuid",
    "email": "waiter1@gmail.com",
    "name": "Nguyen Van A",
    "role": "WAITER",
    "branchId": "branch_456",
    "restaurantId": "restaurant_123",
    "status": "ACTIVE",
    "tempPassword": "Abc12345"
  }
}
```

---

### Bước 4: Test Error Cases

#### Test 1: Email đã tồn tại
```json
POST /api/v1/staff
{
  "name": "Another User",
  "email": "waiter1@gmail.com",  // Email trùng
  "role": "CHEF",
  "branchId": "branch_456"
}

Expected: 400 Bad Request
{
  "success": false,
  "message": "Email already registered"
}
```

#### Test 2: Branch không tồn tại
```json
POST /api/v1/staff
{
  "name": "Test User",
  "email": "test@gmail.com",
  "role": "WAITER",
  "branchId": "invalid_branch_id"
}

Expected: 400 Bad Request
{
  "success": false,
  "message": "Branch not found"
}
```

#### Test 3: Role không hợp lệ
```json
POST /api/v1/staff
{
  "name": "Test User",
  "email": "test@gmail.com",
  "role": "INVALID_ROLE",
  "branchId": "branch_456"
}

Expected: 400 Bad Request
{
  "success": false,
  "message": "Validation error",
  "errors": [...]
}
```

#### Test 4: Không có quyền (STAFF role)
```
1. Login với tài khoản STAFF
2. Dùng access token của STAFF để gọi API

Expected: 403 Forbidden
{
  "success": false,
  "message": "Only Owner or Manager can create staff accounts"
}
```

---

## 📊 Database Changes

### Table: users
```sql
INSERT INTO users (
  id,
  restaurant_id,
  branch_id,
  email,
  password_hash,
  full_name,
  phone,
  role,
  status,
  created_at,
  updated_at
) VALUES (
  'uuid-generated',
  'restaurant_123',
  'branch_456',
  'staff1@gmail.com',
  '$2a$12$hashed_password',
  'Nguyen Van A',
  NULL,
  'WAITER',
  'ACTIVE',
  NOW(),
  NOW()
);
```

---

## ✅ Acceptance Criteria

- [x] Restaurant tồn tại
- [x] Branch tồn tại và thuộc restaurant
- [x] Email chưa tồn tại
- [x] Tạo staff account với role mặc định
- [x] Gửi email kích hoạt (với temporary password)
- [x] Chỉ OWNER/MANAGER mới có quyền tạo staff
- [x] Validate input data (name, email, role, branchId)
- [x] Transaction safety (rollback nếu có lỗi)

---

## 🔐 Security Notes

1. **Temporary Password**: 
   - Random 8 ký tự
   - Chỉ hiển thị trong development mode
   - Nên bắt staff đổi password ngay lần đầu login

2. **Email Verification**:
   - Email được gửi async (không block response)
   - Nếu email fail, staff vẫn được tạo
   - Admin có thể resend email hoặc reset password

3. **Authorization**:
   - Kiểm tra role trong JWT token
   - Kiểm tra branch thuộc restaurant của user
   - Không cho phép tạo staff cho restaurant khác

---

## 📝 Notes

- Temporary password được generate random mỗi lần
- Email service hiện tại chỉ log ra console (cần integrate SendGrid/AWS SES)
- Staff được tạo với status ACTIVE ngay lập tức
- Có thể mở rộng thêm field: phone, avatar, permissions
