# HƯỚNG DẪN TẠO STORIES - PHẦN 1
## Epic 1-3: Authentication, Restaurant, Branch (21 Stories)

---

## 📋 EPIC 1: AUTHENTICATION & AUTHORIZATION (8 Stories)

### Cách tạo Story:
1. Click nút **"Create"** (phím C)
2. **Work type**: Chọn **"Story"** (KHÔNG phải Epic)
3. Điền thông tin theo từng Story bên dưới
4. ✅ Check "Create another" để tạo tiếp
5. Click "Create"

---

### STORY 1: RegisterRestaurantUseCase

**Summary**:
```
RegisterRestaurantUseCase
```

**Parent** (hoặc Epic Link):
```
Authentication & Authorization
```
(Chọn từ dropdown)

**Description**:
```
Implement restaurant owner registration flow with email verification. Create restaurant entity, owner user account, and send verification email. Validate unique email and business information.
```

**Priority**:
```
Highest
```

**Story Points**:
```
5
```

**Labels**:
```
auth
registration
backend
```

✅ Check "Create another" → Click "Create"

---

### STORY 2: LoginUseCase

**Summary**:
```
LoginUseCase
```

**Parent/Epic**:
```
Authentication & Authorization
```

**Description**:
```
Implement secure login with email/password. Generate JWT access token (15min) and refresh token (30 days). Store refresh token in Redis. Log authentication events.
```

**Priority**: `Highest`
**Story Points**: `3`
**Labels**: `auth`, `jwt`, `backend`

✅ Check "Create another" → Click "Create"

---

### STORY 3: RefreshTokenUseCase

**Summary**: `RefreshTokenUseCase`
**Parent/Epic**: `Authentication & Authorization`

**Description**:
```
Implement token refresh mechanism. Validate refresh token from Redis, generate new access token. Handle token rotation and blacklisting.
```

**Priority**: `Highest`
**Story Points**: `3`
**Labels**: `auth`, `jwt`, `backend`

✅ Check "Create another" → Click "Create"

---

### STORY 4: LogoutUseCase

**Summary**: `LogoutUseCase`
**Parent/Epic**: `Authentication & Authorization`

**Description**:
```
Implement logout functionality. Invalidate refresh token in Redis, add access token to blacklist. Clear user session.
```

**Priority**: `High`
**Story Points**: `2`
**Labels**: `auth`, `backend`

✅ Check "Create another" → Click "Create"

---

### STORY 5: ForgotPasswordUseCase

**Summary**: `ForgotPasswordUseCase`
**Parent/Epic**: `Authentication & Authorization`

**Description**:
```
Implement forgot password flow. Generate secure reset token, send email with reset link. Token expires in 1 hour.
```

**Priority**: `High`
**Story Points**: `3`
**Labels**: `auth`, `email`, `backend`

✅ Check "Create another" → Click "Create"

---

### STORY 6: ResetPasswordUseCase

**Summary**: `ResetPasswordUseCase`
**Parent/Epic**: `Authentication & Authorization`

**Description**:
```
Implement password reset with token validation. Verify token, hash new password with bcrypt (12 rounds), invalidate reset token.
```

**Priority**: `High`
**Story Points**: `3`
**Labels**: `auth`, `security`, `backend`

✅ Check "Create another" → Click "Create"

---

### STORY 7: ChangePasswordUseCase

**Summary**: `ChangePasswordUseCase`
**Parent/Epic**: `Authentication & Authorization`

**Description**:
```
Implement password change for authenticated users. Verify old password, validate new password strength, update with bcrypt hash.
```

**Priority**: `Medium`
**Story Points**: `2`
**Labels**: `auth`, `backend`

✅ Check "Create another" → Click "Create"

---

### STORY 8: VerifyEmailUseCase (CUỐI EPIC 1)

**Summary**: `VerifyEmailUseCase`
**Parent/Epic**: `Authentication & Authorization`

**Description**:
```
Implement email verification after registration. Validate verification token, activate user account, update email_verified status.
```

**Priority**: `High`
**Story Points**: `3`
**Labels**: `auth`, `email`, `backend`

✅ Check "Create another" → Click "Create"

---

## 📋 EPIC 2: RESTAURANT MANAGEMENT (6 Stories)

### STORY 9: CreateRestaurantUseCase

**Summary**: `CreateRestaurantUseCase`
**Parent/Epic**: `Restaurant Management`

**Description**:
```
Create new restaurant entity during registration. Initialize with default settings, create first subscription (trial), set up tenant context.
```

**Priority**: `Highest`
**Story Points**: `5`
**Labels**: `restaurant`, `tenant`, `backend`

✅ Check "Create another" → Click "Create"

---

### STORY 10: UpdateRestaurantUseCase

**Summary**: `UpdateRestaurantUseCase`
**Parent/Epic**: `Restaurant Management`

**Description**:
```
Update restaurant profile information including name, contact details, business hours. Validate tenant ownership before update.
```

**Priority**: `High`
**Story Points**: `3`
**Labels**: `restaurant`, `backend`

✅ Check "Create another" → Click "Create"

---

### STORY 11: GetRestaurantDetailsUseCase

**Summary**: `GetRestaurantDetailsUseCase`
**Parent/Epic**: `Restaurant Management`

**Description**:
```
Retrieve complete restaurant details including subscription status, feature limits, branch count, and statistics.
```

**Priority**: `High`
**Story Points**: `2`
**Labels**: `restaurant`, `backend`

✅ Check "Create another" → Click "Create"

---

### STORY 12: UploadRestaurantLogoUseCase

**Summary**: `UploadRestaurantLogoUseCase`
**Parent/Epic**: `Restaurant Management`

**Description**:
```
Upload restaurant logo to Cloudinary. Validate image format (JPEG/PNG/WEBP), size limit (5MB). Store URL in database.
```

**Priority**: `Medium`
**Story Points**: `3`
**Labels**: `restaurant`, `media`, `backend`

✅ Check "Create another" → Click "Create"

---

### STORY 13: GetRestaurantStatisticsUseCase

**Summary**: `GetRestaurantStatisticsUseCase`
**Parent/Epic**: `Restaurant Management`

**Description**:
```
Generate restaurant-wide statistics: total revenue, order count, active branches, table utilization, popular items. Cache results.
```

**Priority**: `High`
**Story Points**: `5`
**Labels**: `restaurant`, `analytics`, `backend`

✅ Check "Create another" → Click "Create"

---

### STORY 14: DeleteRestaurantUseCase (CUỐI EPIC 2)

**Summary**: `DeleteRestaurantUseCase`
**Parent/Epic**: `Restaurant Management`

**Description**:
```
Soft delete restaurant and cascade to all related entities. Archive data, cancel subscription, notify owner via email.
```

**Priority**: `Low`
**Story Points**: `2`
**Labels**: `restaurant`, `backend`

✅ Check "Create another" → Click "Create"

---

## 📋 EPIC 3: BRANCH MANAGEMENT (7 Stories)

### STORY 15: CreateBranchUseCase

**Summary**: `CreateBranchUseCase`
**Parent/Epic**: `Branch Management`

**Description**:
```
Create new branch under restaurant. Validate subscription limits (max branches). Initialize with areas and default settings.
```

**Priority**: `Highest`
**Story Points**: `5`
**Labels**: `branch`, `backend`

✅ Check "Create another" → Click "Create"

---

### STORY 16: UpdateBranchUseCase

**Summary**: `UpdateBranchUseCase`
**Parent/Epic**: `Branch Management`

**Description**:
```
Update branch information: name, address, phone, business hours. Validate tenant ownership and branch existence.
```

**Priority**: `High`
**Story Points**: `3`
**Labels**: `branch`, `backend`

✅ Check "Create another" → Click "Create"

---

### STORY 17: GetBranchDetailsUseCase

**Summary**: `GetBranchDetailsUseCase`
**Parent/Epic**: `Branch Management`

**Description**:
```
Retrieve branch details including areas, table count, active orders, staff assigned, and current status.
```

**Priority**: `High`
**Story Points**: `2`
**Labels**: `branch`, `backend`

✅ Check "Create another" → Click "Create"

---

### STORY 18: ListBranchesUseCase

**Summary**: `ListBranchesUseCase`
**Parent/Epic**: `Branch Management`

**Description**:
```
List all branches with pagination, filtering, and sorting. Support search by name/address. Cache results.
```

**Priority**: `High`
**Story Points**: `3`
**Labels**: `branch`, `backend`

✅ Check "Create another" → Click "Create"

---

### STORY 19: DeleteBranchUseCase

**Summary**: `DeleteBranchUseCase`
**Parent/Epic**: `Branch Management`

**Description**:
```
Soft delete branch. Validate no active orders, reassign staff, archive data. Prevent deletion if only branch.
```

**Priority**: `Medium`
**Story Points**: `3`
**Labels**: `branch`, `backend`

✅ Check "Create another" → Click "Create"

---

### STORY 20: GetBranchStatisticsUseCase

**Summary**: `GetBranchStatisticsUseCase`
**Parent/Epic**: `Branch Management`

**Description**:
```
Generate branch-specific statistics: daily revenue, order count, table turnover, peak hours, staff performance.
```

**Priority**: `High`
**Story Points**: `5`
**Labels**: `branch`, `analytics`, `backend`

✅ Check "Create another" → Click "Create"

---

### STORY 21: SetBranchStatusUseCase (CUỐI EPIC 3)

**Summary**: `SetBranchStatusUseCase`
**Parent/Epic**: `Branch Management`

**Description**:
```
Update branch operational status (active/inactive/maintenance). Notify staff, update table availability.
```

**Priority**: `Medium`
**Story Points**: `2`
**Labels**: `branch`, `backend`

✅ Check "Create another" → Click "Create"

---

## ✅ HOÀN THÀNH 21 STORIES ĐẦU TIÊN!

Tiếp tục với file PART 2 để tạo các Stories còn lại.
