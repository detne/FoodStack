# 🎯 Register Screen Guide - User & Restaurant Selection

## ✨ Tính năng mới

### 🔄 **Dual Registration System**
- **Khách hàng (User)**: Đăng ký để đặt món ăn
- **Nhà hàng (Restaurant)**: Đăng ký để quản lý nhà hàng

## 📱 Giao diện mới

### 1. **User Type Selection**
```
┌─────────────────────────────────────┐
│  👤 Khách hàng    │  🏪 Nhà hàng     │
│  Đặt món ăn       │  Quản lý nhà hàng │
└─────────────────────────────────────┘
```

### 2. **Dynamic Form Fields**
- **Common Fields** (cả 2 loại):
  - Họ và tên *
  - Email *
  - Số điện thoại
  - Mật khẩu *
  - Xác nhận mật khẩu *

- **Restaurant Only Fields**:
  - Tên nhà hàng *
  - Email nhà hàng *
  - Địa chỉ nhà hàng

## 🎨 UI Features

### **User Type Buttons**
- ✅ **Visual Selection**: Active state với border orange
- ✅ **Icons**: 👤 cho User, 🏪 cho Restaurant
- ✅ **Descriptions**: Mô tả ngắn gọn chức năng
- ✅ **Smooth Transition**: Form fields thay đổi mượt mà

### **Form Validation**
- ✅ **Smart Validation**: Chỉ validate fields cần thiết theo user type
- ✅ **Real-time Feedback**: Error messages rõ ràng
- ✅ **Required Field Indicators**: Dấu * cho fields bắt buộc

### **Visual Design**
- ✅ **Consistent Styling**: Đồng nhất với LoginScreen
- ✅ **Gradient Header**: Orange gradient với logo
- ✅ **Card Layout**: Form trong card với shadow
- ✅ **Icon Integration**: Icons cho mỗi input field

## 🧪 Test Cases

### **User Registration**
```
1. Chọn "👤 Khách hàng"
2. Điền thông tin:
   - Họ tên: "Nguyễn Văn A"
   - Email: "user@example.com"
   - SĐT: "0123456789"
   - Mật khẩu: "123456"
   - Xác nhận: "123456"
3. Nhấn "Đăng ký" → Success
```

### **Restaurant Registration**
```
1. Chọn "🏪 Nhà hàng"
2. Điền thông tin cá nhân + nhà hàng:
   - Họ tên: "Trần Thị B"
   - Email: "owner@example.com"
   - SĐT: "0987654321"
   - Mật khẩu: "123456"
   - Xác nhận: "123456"
   - Tên nhà hàng: "Nhà hàng ABC"
   - Email nhà hàng: "restaurant@example.com"
   - Địa chỉ: "123 Đường XYZ"
3. Nhấn "Đăng ký" → Success
```

### **Validation Tests**
```
✗ Để trống required fields → Error message
✗ Email không hợp lệ → "Email không hợp lệ"
✗ Mật khẩu < 6 ký tự → "Mật khẩu phải có ít nhất 6 ký tự"
✗ Mật khẩu không khớp → "Mật khẩu xác nhận không khớp"
✗ (Restaurant) Thiếu thông tin nhà hàng → Error message
```

## 🔄 User Flow

```
LoginScreen → "Đăng ký ngay"
    ↓
RegisterScreen
    ↓
[Chọn User Type] → [Điền Form] → [Validate] → [Submit]
    ↓
Success Alert → LoginScreen
```

## 💡 UX Improvements

### **Smart Form**
- Form fields xuất hiện/ẩn dựa trên user type
- Validation rules thay đổi theo context
- Clear visual feedback cho selection

### **Better Onboarding**
- Người dùng hiểu rõ họ đang đăng ký loại tài khoản gì
- Phân biệt rõ ràng giữa customer và business account
- Guided experience với descriptions

### **Accessibility**
- Clear labels và placeholders
- Visual indicators cho required fields
- Error messages descriptive

## 🚀 Technical Implementation

### **State Management**
```typescript
const [userType, setUserType] = useState<'user' | 'restaurant'>('user');
```

### **Conditional Rendering**
```typescript
{userType === 'restaurant' && (
  // Restaurant specific fields
)}
```

### **Smart Validation**
```typescript
// Only validate restaurant fields if restaurant type selected
if (userType === 'restaurant') {
  if (!formData.restaurantName.trim()) {
    Alert.alert('Lỗi', 'Vui lòng nhập tên nhà hàng');
    return false;
  }
}
```

## 🎯 Benefits

1. **Clear User Intent**: Người dùng biết rõ họ đang tạo loại tài khoản gì
2. **Reduced Friction**: Chỉ hiển thị fields cần thiết
3. **Better Data Quality**: Validation phù hợp với từng user type
4. **Scalable**: Dễ dàng thêm user types mới trong tương lai
5. **Professional**: Phân biệt rõ B2C và B2B users

**Perfect cho food delivery app với cả customers và restaurant owners!** 🎉