# ✅ Frontend Test Checklist

## 🎯 Mục tiêu
Test tất cả UI components và flows đã code

---

## 📱 Test trên Browser

### Bước 1: Mở ứng dụng
```
URL: http://localhost:5173
```

---

## 🔐 Authentication Tests

### Test 1.1: Login Page UI
**URL:** `http://localhost:5173/login`

- [ ] Logo "QRService" hiển thị ở header
- [ ] Title "Welcome Back" hiển thị
- [ ] Subtitle "Enter your details..." hiển thị
- [ ] Google login button có icon và text
- [ ] Facebook login button có icon và text
- [ ] Divider "Or continue with" hiển thị
- [ ] Email input field có placeholder "name@company.com"
- [ ] Password input field có placeholder "••••••••"
- [ ] Eye icon để show/hide password
- [ ] "Remember me" checkbox
- [ ] "Forgot password?" link
- [ ] "Sign in" button màu indigo
- [ ] "Don't have an account? Sign Up" link
- [ ] Footer với Privacy/Terms/Support links
- [ ] Trusted by section với placeholder icons

### Test 1.2: Login Validation
**URL:** `http://localhost:5173/login`

**Test Case 1: Empty fields**
- [ ] Click "Sign in" khi chưa nhập gì
- [ ] Browser validation "Please fill out this field" xuất hiện

**Test Case 2: Invalid email format**
- [ ] Nhập email: `notanemail`
- [ ] Nhập password: `Test123456`
- [ ] Click "Sign in"
- [ ] Browser validation "Please include an '@'" xuất hiện

**Test Case 3: Wrong credentials**
- [ ] Nhập email: `wrong@example.com`
- [ ] Nhập password: `WrongPassword`
- [ ] Click "Sign in"
- [ ] Toast error "Login failed" xuất hiện
- [ ] Vẫn ở trang login

### Test 1.3: Login Success
**URL:** `http://localhost:5173/login`

**Prerequisites:** Đã tạo account test (xem TESTING-GUIDE.md)

- [ ] Nhập email: `test@example.com`
- [ ] Nhập password: `Test123456`
- [ ] Click "Sign in"
- [ ] Button text đổi thành "Signing in..."
- [ ] Button bị disable trong lúc loading
- [ ] Toast success "Login successful" xuất hiện
- [ ] Redirect sang `/dashboard` trong 1-2 giây
- [ ] URL bar hiển thị `http://localhost:5173/dashboard`

### Test 1.4: Password Toggle
**URL:** `http://localhost:5173/login`

- [ ] Nhập password: `Test123456`
- [ ] Password hiển thị dạng dots: `••••••••••`
- [ ] Click eye icon
- [ ] Password hiển thị plain text: `Test123456`
- [ ] Icon đổi thành eye-off
- [ ] Click lại eye-off icon
- [ ] Password lại hiển thị dạng dots

### Test 1.5: Remember Me
**URL:** `http://localhost:5173/login`

- [ ] Check "Remember me" checkbox
- [ ] Login thành công
- [ ] Mở DevTools → Application → Local Storage
- [ ] Kiểm tra `access_token` được lưu
- [ ] Kiểm tra `refresh_token` được lưu (nếu có)

### Test 1.6: Navigation Links
**URL:** `http://localhost:5173/login`

- [ ] Click "Sign Up" link
- [ ] Redirect sang `/onboarding`
- [ ] Click "Forgot password?" link
- [ ] Redirect sang `/forgot-password` (hoặc hiện modal)

---

## 📊 Dashboard Tests

### Test 2.1: Dashboard Layout
**URL:** `http://localhost:5173/dashboard`
**Prerequisites:** Đã login

**Sidebar (Trái):**
- [ ] Logo QRService hiển thị
- [ ] Navigation items hiển thị đầy đủ:
  - [ ] Dashboard (highlighted/active)
  - [ ] Branches
  - [ ] Staff
  - [ ] Menu Items
  - [ ] Categories
  - [ ] Orders
  - [ ] Reservations
  - [ ] QR Codes
  - [ ] Reviews
  - [ ] Analytics
  - [ ] Settings (ở dưới cùng)
- [ ] Collapse button hiển thị

**Top Bar (Trên):**
- [ ] Search bar hiển thị với placeholder "Search..."
- [ ] Bell icon với badge số "3"
- [ ] User avatar với initials (VD: "TO" cho Test Owner)
- [ ] User name hiển thị bên cạnh avatar
- [ ] User role hiển thị (VD: "Admin")

**Main Content:**
- [ ] Page title "Dashboard Overview" hiển thị
- [ ] Subtitle "Welcome back! Here's what's happening today."
- [ ] Button "Add Branch" màu primary
- [ ] 4 KPI cards hiển thị:
  - [ ] Total Revenue: $12,540
  - [ ] Total Orders: 1,204
  - [ ] Active Tables: 42
  - [ ] Avg. Service Time: 14m 20s
- [ ] Mỗi card có icon tương ứng
- [ ] Mỗi card có trend percentage (màu xanh/đỏ)
- [ ] Revenue Performance chart card
- [ ] Live Operations card với 3 branches
- [ ] Recent Activity card với 3 activities
- [ ] Top Performing Items card với 3 items

### Test 2.2: Sidebar Collapse
**URL:** `http://localhost:5173/dashboard`

**Collapse:**
- [ ] Click nút collapse (ChevronLeft icon)
- [ ] Sidebar thu nhỏ xuống ~64px width
- [ ] Chỉ hiển thị icons, text bị ẩn
- [ ] Main content mở rộng sang trái
- [ ] Icon xoay 180 độ
- [ ] Animation mượt mà (~300ms)

**Expand:**
- [ ] Click nút collapse lần nữa
- [ ] Sidebar mở rộng về 256px width
- [ ] Text hiển thị lại
- [ ] Main content thu nhỏ lại
- [ ] Icon xoay về vị trí ban đầu

### Test 2.3: Sidebar Navigation
**URL:** `http://localhost:5173/dashboard`

- [ ] Click "Branches" → URL đổi sang `/branches`
- [ ] Click "Staff" → URL đổi sang `/staff`
- [ ] Click "Menu Items" → URL đổi sang `/menu-items`
- [ ] Click "Dashboard" → Quay lại `/dashboard`
- [ ] Active item được highlight (background khác màu)

### Test 2.4: Top Bar Search
**URL:** `http://localhost:5173/dashboard`

- [ ] Click vào search bar
- [ ] Input được focus
- [ ] Nhập text "test"
- [ ] Text hiển thị trong input
- [ ] (TODO: Search functionality)

### Test 2.5: Notifications Dropdown
**URL:** `http://localhost:5173/dashboard`

- [ ] Click bell icon
- [ ] Dropdown menu xuất hiện
- [ ] Header "Notifications" hiển thị
- [ ] 3 notifications hiển thị:
  - [ ] "New order received" - 2 minutes ago
  - [ ] "Staff shift started" - 15 minutes ago
  - [ ] "Low stock alert" - 1 hour ago
- [ ] Mỗi notification có icon tương ứng
- [ ] "View all notifications" link ở cuối
- [ ] Click bên ngoài → Dropdown đóng lại

### Test 2.6: User Menu Dropdown
**URL:** `http://localhost:5173/dashboard`

- [ ] Click user avatar/name
- [ ] Dropdown menu xuất hiện
- [ ] Header "My Account" hiển thị
- [ ] Menu items:
  - [ ] Profile (với User icon)
  - [ ] Settings (với Settings icon)
  - [ ] Logout (với LogOut icon, màu đỏ)
- [ ] Click "Profile" → Navigate sang `/profile`
- [ ] Click "Settings" → Navigate sang `/settings`

### Test 2.7: Logout Flow
**URL:** `http://localhost:5173/dashboard`

- [ ] Click user avatar
- [ ] Click "Logout"
- [ ] Redirect sang `/login`
- [ ] Mở DevTools → Local Storage
- [ ] `access_token` đã bị xóa
- [ ] `refresh_token` đã bị xóa
- [ ] Thử access `/dashboard` trực tiếp
- [ ] (TODO: Should redirect to login)

### Test 2.8: KPI Cards
**URL:** `http://localhost:5173/dashboard`

- [ ] Hover vào card → Shadow tăng lên
- [ ] Card có border radius mượt
- [ ] Icon có background màu primary/10
- [ ] Trend có màu xanh (positive) hoặc đỏ (negative)
- [ ] Font sizes hợp lý (title: sm, value: 2xl)

### Test 2.9: Live Operations
**URL:** `http://localhost:5173/dashboard`

- [ ] Badge "Live" có dot xanh nhấp nháy (animate-pulse)
- [ ] 3 branches hiển thị:
  - [ ] Downtown Branch - AVAILABLE (badge xanh)
  - [ ] Uptown Gastro - BUSY (badge cam)
  - [ ] Airport Terminal - AVAILABLE (badge xanh)
- [ ] Mỗi branch có icon MapPin
- [ ] Hiển thị số tables và staff
- [ ] Hover vào branch card → Background đổi màu
- [ ] "View Full Map →" link ở cuối

### Test 2.10: Recent Activity
**URL:** `http://localhost:5173/dashboard`

- [ ] 3 activities hiển thị với icons màu khác nhau:
  - [ ] Order (xanh lá)
  - [ ] Service (cam)
  - [ ] Payment (xanh dương)
- [ ] Mỗi activity có title, branch, time
- [ ] Activity có amount hiển thị amount
- [ ] Hover vào activity → Background đổi màu
- [ ] "View All" link ở header

### Test 2.11: Top Performing Items
**URL:** `http://localhost:5173/dashboard`

- [ ] 3 items hiển thị với progress bars
- [ ] Progress bar có màu primary
- [ ] Progress bar width tương ứng với percentage
- [ ] Hiển thị số lượng sold
- [ ] "View Full Menu Analytics" button ở cuối

---

## 📱 Responsive Tests

### Test 3.1: Mobile View (375px)
**URL:** `http://localhost:5173/dashboard`

- [ ] Mở DevTools → Toggle device toolbar
- [ ] Chọn iPhone SE (375px)
- [ ] Sidebar tự động collapse hoặc ẩn
- [ ] Top bar responsive
- [ ] KPI cards stack thành 1 cột
- [ ] Charts và cards responsive
- [ ] Text không bị overflow

### Test 3.2: Tablet View (768px)
**URL:** `http://localhost:5173/dashboard`

- [ ] Chọn iPad (768px)
- [ ] KPI cards hiển thị 2 cột
- [ ] Sidebar vẫn hiển thị đầy đủ
- [ ] Layout cân đối

### Test 3.3: Desktop View (1920px)
**URL:** `http://localhost:5173/dashboard`

- [ ] Chọn Desktop (1920px)
- [ ] KPI cards hiển thị 4 cột
- [ ] Content không bị stretch quá rộng
- [ ] Spacing hợp lý

---

## 🎨 Visual Tests

### Test 4.1: Colors
- [ ] Primary color là purple (#a855f7)
- [ ] Success color là green
- [ ] Warning color là orange
- [ ] Danger color là red
- [ ] Background là light gray (#fafafa)

### Test 4.2: Typography
- [ ] Font family nhất quán (system font)
- [ ] Heading sizes phân cấp rõ ràng
- [ ] Line height dễ đọc
- [ ] Text color contrast đủ (WCAG AA)

### Test 4.3: Spacing
- [ ] Padding/margin nhất quán
- [ ] Card spacing đều đặn
- [ ] Section spacing hợp lý

### Test 4.4: Animations
- [ ] Sidebar collapse/expand mượt
- [ ] Hover effects mượt
- [ ] Dropdown animations mượt
- [ ] Loading states có animation

---

## 🐛 Browser Compatibility

### Test 5.1: Chrome
- [ ] Tất cả features hoạt động
- [ ] UI hiển thị đúng
- [ ] No console errors

### Test 5.2: Firefox
- [ ] Tất cả features hoạt động
- [ ] UI hiển thị đúng
- [ ] No console errors

### Test 5.3: Safari (nếu có Mac)
- [ ] Tất cả features hoạt động
- [ ] UI hiển thị đúng
- [ ] No console errors

### Test 5.4: Edge
- [ ] Tất cả features hoạt động
- [ ] UI hiển thị đúng
- [ ] No console errors

---

## 🔍 DevTools Checks

### Test 6.1: Console
**URL:** `http://localhost:5173/dashboard`

- [ ] Mở DevTools (F12)
- [ ] Tab Console
- [ ] Không có errors màu đỏ
- [ ] Warnings (nếu có) là acceptable

### Test 6.2: Network
**URL:** `http://localhost:5173/login` → Login

- [ ] Tab Network
- [ ] Clear network log
- [ ] Login với credentials
- [ ] Kiểm tra request:
  - [ ] POST `/api/v1/auth/login`
  - [ ] Status: 200 OK
  - [ ] Response có `access_token`
  - [ ] Response có `user` object

### Test 6.3: Application Storage
**URL:** `http://localhost:5173/dashboard`

- [ ] Tab Application → Local Storage
- [ ] Kiểm tra keys:
  - [ ] `access_token` tồn tại
  - [ ] `refresh_token` tồn tại (nếu có)
- [ ] Logout
- [ ] Kiểm tra tokens đã bị xóa

### Test 6.4: Performance
**URL:** `http://localhost:5173/dashboard`

- [ ] Tab Performance
- [ ] Record page load
- [ ] Stop recording
- [ ] Kiểm tra:
  - [ ] FCP (First Contentful Paint) < 1.5s
  - [ ] LCP (Largest Contentful Paint) < 2.5s
  - [ ] No long tasks > 50ms

---

## ✅ Summary

**Total Tests:** ~100+

**Categories:**
- Authentication: 15 tests
- Dashboard Layout: 30 tests
- Interactions: 20 tests
- Responsive: 10 tests
- Visual: 15 tests
- Browser: 10 tests
- DevTools: 10 tests

**Pass Rate Target:** 95%+

---

## 📝 Bug Report Template

Nếu tìm thấy bug, báo cáo theo format:

```
**Bug Title:** [Mô tả ngắn gọn]

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. See error

**Expected Result:**
[Kết quả mong đợi]

**Actual Result:**
[Kết quả thực tế]

**Screenshot:**
[Attach screenshot]

**Console Errors:**
[Copy console errors]

**Browser:** Chrome 120
**OS:** Windows 11
**Screen Size:** 1920x1080
```
