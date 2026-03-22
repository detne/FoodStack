# Hướng Dẫn Quản Lý Trạng Thái Menu Cho Manager

## Truy Cập Trang Quản Lý

Manager có thể truy cập trang quản lý trạng thái menu tại:
- URL: `/manager/menu`
- Hoặc từ Manager Dashboard, chọn "Menu" trong sidebar

## Quyền Hạn Của Manager

Manager **CHỈ CÓ THỂ**:
- ✅ Bật/tắt trạng thái món ăn (Available/Unavailable)
- ✅ Thêm lý do khi tắt món (ví dụ: "Hết nguyên liệu")
- ✅ Chỉ ảnh hưởng đến chi nhánh được gán

Manager **KHÔNG THỂ**:
- ❌ Tạo món ăn mới
- ❌ Sửa thông tin món (tên, giá, mô tả, hình ảnh)
- ❌ Xóa món ăn
- ❌ Thay đổi trạng thái của chi nhánh khác

## Cách Sử Dụng

### 1. Bật Món Ăn
1. Tìm món ăn cần bật
2. Bật switch sang phải (màu xanh)
3. Món sẽ hiển thị ngay lập tức cho khách hàng tại chi nhánh

### 2. Tắt Món Ăn
1. Tìm món ăn cần tắt
2. Tắt switch sang trái
3. Hộp thoại sẽ hiện ra yêu cầu nhập lý do (tùy chọn)
4. Nhập lý do (ví dụ: "Hết nguyên liệu", "Tạm ngưng phục vụ")
5. Nhấn "Confirm"
6. Món sẽ bị ẩn khỏi menu cho khách hàng tại chi nhánh

## Lưu Ý Quan Trọng

### Trạng Thái Toàn Cục vs Chi Nhánh
- **Owner tắt món toàn cục**: Món bị ẩn ở TẤT CẢ chi nhánh
- **Manager tắt món tại chi nhánh**: Món chỉ bị ẩn tại chi nhánh đó

### Ví Dụ Thực Tế

**Tình huống 1: Hết nguyên liệu**
```
Chi nhánh Quận 1 hết xương bò
→ Manager tắt món "Phở Bò" với lý do "Hết xương bò"
→ Món chỉ bị ẩn tại Quận 1
→ Chi nhánh Quận 2, 3 vẫn phục vụ bình thường
```

**Tình huống 2: Đã nhập hàng**
```
Chi nhánh Quận 1 đã nhập xương bò
→ Manager bật lại món "Phở Bò"
→ Món hiển thị trở lại tại Quận 1
```

## Xử Lý Lỗi

### "No menu items found"
**Nguyên nhân**:
- Chưa có món ăn nào trong hệ thống
- Đang ở chế độ Owner View (không có branch được chọn)

**Giải pháp**:
- Nếu là Manager thật: Liên hệ Owner để thêm món ăn
- Nếu là Owner đang xem: Quay lại Owner Dashboard và chọn branch

### "Access Denied"
**Nguyên nhân**: Tài khoản không có quyền Manager

**Giải pháp**: Liên hệ Owner để được cấp quyền Manager

### "No Branch Selected"
**Nguyên nhân**: Owner đang xem nhưng chưa chọn branch

**Giải pháp**: Quay lại Owner Dashboard và chọn branch cụ thể

## API Endpoint

Manager sử dụng endpoint:
```
PATCH /api/v1/menu-items/:id/branch-availability
Authorization: Bearer <manager_token>

Body:
{
  "available": false,
  "reason": "Hết nguyên liệu"
}
```

## Troubleshooting

### Kiểm tra quyền
1. Mở Developer Console (F12)
2. Xem tab "Debug" trong thông báo màu xanh
3. Kiểm tra: `Role`, `Branch ID`, `Owner View`

### Kiểm tra API
1. Mở Developer Console (F12)
2. Xem tab "Network"
3. Tìm request `branch-availability`
4. Kiểm tra response

### Liên hệ hỗ trợ
Nếu vẫn gặp lỗi, cung cấp thông tin:
- Role của user
- Branch ID
- Screenshot màn hình
- Console log (F12 > Console)
