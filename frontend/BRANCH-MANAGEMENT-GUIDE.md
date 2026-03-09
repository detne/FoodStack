# 🏢 Branch Management - Testing Guide

## ✅ Đã hoàn thành

### 1. Branch List Page (`/branches`)
- Grid layout với branch cards
- Search branches by name/address
- Filter by status (Active, Maintenance, Closed)
- Stats cards (Total, Active, Maintenance, Total Tables)
- View, Edit, Delete actions
- Responsive design

### 2. Create Branch Page (`/branches/create`)
- Form đầy đủ với validation
- Sections: Basic Info, Location, Contact, Hours, Manager
- Save và Cancel buttons
- Toast notifications

### 3. Components
- `BranchCard` - Reusable card component
- API Client methods cho branches

---

## 🧪 Cách test

### Test 1: Branch List Page

1. **Navigate to Branches**
   ```
   http://localhost:5173/branches
   ```
   hoặc click "Branches" trong sidebar

2. **Kiểm tra UI:**
   - ✅ Page title "Branches"
   - ✅ "Add Branch" button (góc phải trên)
   - ✅ 4 stats cards (Total: 3, Active: 2, Maintenance: 1, Total Tables: 85)
   - ✅ Search bar
   - ✅ Status filter dropdown
   - ✅ 3 branch cards hiển thị:
     - Downtown Branch (Active)
     - Uptown Gastro (Active)
     - Airport Terminal (Maintenance)

3. **Test Search:**
   - Nhập "downtown" → Chỉ hiển thị Downtown Branch
   - Nhập "airport" → Chỉ hiển thị Airport Terminal
   - Clear search → Hiển thị lại tất cả

4. **Test Filter:**
   - Chọn "Active" → Hiển thị 2 branches
   - Chọn "Maintenance" → Hiển thị 1 branch
   - Chọn "All Status" → Hiển thị tất cả

5. **Test Branch Card:**
   - ✅ Cover image/placeholder
   - ✅ Status badge (màu xanh/cam)
   - ✅ Branch name
   - ✅ Address với icon
   - ✅ 3 stats: Tables, Staff, Orders
   - ✅ Today's Revenue
   - ✅ 3 action buttons: View, Edit, Delete

6. **Test Actions:**
   - Click "View" → Navigate sang `/branches/1` (404 - chưa code)
   - Click "Edit" → Navigate sang `/branches/1/edit` (404 - chưa code)
   - Click "Delete" → Hiển thị confirmation dialog
     - Click "Cancel" → Đóng dialog
     - Click "Delete" → Xóa branch, hiển thị toast

---

### Test 2: Create Branch Page

1. **Navigate to Create**
   ```
   http://localhost:5173/branches/create
   ```
   hoặc click "Add Branch" button

2. **Kiểm tra UI:**
   - ✅ Back button (arrow left)
   - ✅ Page title "Create New Branch"
   - ✅ 5 sections:
     - Basic Information
     - Location Details
     - Contact Information
     - Operating Hours
     - Branch Manager
   - ✅ Cancel và Create Branch buttons

3. **Test Form Fields:**

   **Basic Information:**
   - Branch Name (required) ✅
   - Status dropdown (Active/Maintenance/Closed) ✅
   - Description textarea ✅

   **Location Details:**
   - Street Address (required) ✅
   - City (required) ✅
   - State/Province ✅
   - Zip Code ✅
   - Country (default: Vietnam) ✅

   **Contact Information:**
   - Phone Number (required) ✅
   - Email ✅

   **Operating Hours:**
   - Opening Time (time picker) ✅
   - Closing Time (time picker) ✅

   **Branch Manager:**
   - Manager Name ✅
   - Manager Phone ✅
   - Manager Email ✅

4. **Test Validation:**
   - Click "Create Branch" khi form rỗng
   - Browser validation hiển thị cho required fields
   - Nhập email sai format → Validation error

5. **Test Submit:**
   - Điền form đầy đủ:
     ```
     Name: Test Branch
     Address: 123 Test Street
     City: Ho Chi Minh
     Phone: +84 123 456 789
     ```
   - Click "Create Branch"
   - ✅ Toast "Branch created" hiển thị
   - ✅ Redirect về `/branches` sau 1 giây

6. **Test Cancel:**
   - Click "Cancel" button
   - ✅ Redirect về `/branches` ngay lập tức

7. **Test Back Button:**
   - Click back arrow (góc trái trên)
   - ✅ Redirect về `/branches`

---

## 📱 Responsive Tests

### Mobile View (375px)
- [ ] Branch cards stack thành 1 cột
- [ ] Stats cards stack thành 1 cột
- [ ] Search và filter stack vertically
- [ ] Form fields stack thành 1 cột
- [ ] Action buttons full width

### Tablet View (768px)
- [ ] Branch cards hiển thị 2 cột
- [ ] Stats cards hiển thị 2 cột
- [ ] Form fields hiển thị 2 cột

### Desktop View (1920px)
- [ ] Branch cards hiển thị 3 cột
- [ ] Stats cards hiển thị 4 cột
- [ ] Form max-width 4xl (không quá rộng)

---

## 🎨 Visual Checks

### Branch List
- [ ] Cards có hover effect (shadow tăng)
- [ ] Status badges màu đúng (xanh/cam/đỏ)
- [ ] Icons rõ ràng và aligned
- [ ] Spacing đều đặn
- [ ] Empty state khi không có branches

### Create Form
- [ ] Sections có border và spacing rõ ràng
- [ ] Labels bold và dễ đọc
- [ ] Input fields có placeholder
- [ ] Required fields có dấu *
- [ ] Buttons có icons và colors đúng

---

## 🐛 Known Issues

### Mock Data
- ⚠️ Đang dùng mock data (3 branches cố định)
- ⚠️ Create branch chưa lưu vào database
- ⚠️ Delete branch chỉ xóa trong state
- ⚠️ View và Edit pages chưa code

### TODO
- [ ] Kết nối với backend API
- [ ] Code Edit Branch page
- [ ] Code Branch Details page
- [ ] Upload branch images
- [ ] Real-time stats updates

---

## 🚀 Next Steps

Sau khi test xong Branch Management, chọn tiếp:

**Option 1: Hoàn thiện Branch Management**
- Edit Branch page
- Branch Details/Dashboard page
- Upload branch images
- Kết nối backend API

**Option 2: Menu Items Management**
- Menu Items List
- Create/Edit Menu Item
- Upload food images
- Categories integration

**Option 3: Categories Management**
- Category List
- Create/Edit Category
- Drag & drop reorder

---

## ✅ Test Checklist

### Branch List Page
- [ ] Page loads without errors
- [ ] 3 mock branches hiển thị
- [ ] Stats cards hiển thị đúng
- [ ] Search hoạt động
- [ ] Filter hoạt động
- [ ] View button navigate
- [ ] Edit button navigate
- [ ] Delete dialog hiển thị
- [ ] Delete confirmation works
- [ ] Add Branch button navigate
- [ ] Responsive trên mobile

### Create Branch Page
- [ ] Page loads without errors
- [ ] All form sections hiển thị
- [ ] All fields editable
- [ ] Required validation works
- [ ] Submit creates branch
- [ ] Toast notification hiển thị
- [ ] Redirect after create
- [ ] Cancel button works
- [ ] Back button works
- [ ] Responsive trên mobile

---

## 📝 Bug Report

Nếu tìm thấy bug:

```
**Page:** Branch List / Create Branch
**Issue:** [Mô tả ngắn gọn]
**Steps:**
1. Go to...
2. Click...
3. See error

**Expected:** [Kết quả mong đợi]
**Actual:** [Kết quả thực tế]
**Screenshot:** [Attach]
**Console:** [Copy errors]
```

---

**Happy Testing! 🎉**
