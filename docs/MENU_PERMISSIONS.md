# Phân Quyền Quản Lý Menu

## Tổng Quan

Hệ thống phân quyền quản lý menu được thiết kế với 2 cấp độ:
- **Owner**: Quản lý toàn bộ menu (tạo, sửa, xóa món ăn)
- **Manager**: Chỉ quản lý trạng thái available/unavailable của món ăn trong chi nhánh được gán

## Chi Tiết Phân Quyền

### Owner (Chủ Nhà Hàng)

Owner có toàn quyền quản lý menu:

1. **Tạo món ăn mới** - `POST /api/v1/menu-items`
2. **Cập nhật thông tin món ăn** - `PUT /api/v1/menu-items/:id`
   - Tên món
   - Mô tả
   - Giá
   - Danh mục
   - Hình ảnh
3. **Xóa món ăn** - `DELETE /api/v1/menu-items/:id`
4. **Cập nhật trạng thái toàn cục** - `PATCH /api/v1/menu-items/:id/availability`
   - Cập nhật trường `available` trong bảng `menu_items`
   - Áp dụng cho tất cả chi nhánh (mặc định)

### Manager (Quản Lý Chi Nhánh)

Manager chỉ có quyền quản lý trạng thái món ăn trong chi nhánh của mình:

1. **Cập nhật trạng thái theo chi nhánh** - `PATCH /api/v1/menu-items/:id/branch-availability`
   - Chỉ cập nhật cho chi nhánh được gán (`user.branch_id`)
   - Lưu vào bảng `menu_item_availability`
   - Có thể thêm lý do (ví dụ: "Hết nguyên liệu", "Tạm ngưng phục vụ")

**Lưu ý**: Manager KHÔNG thể:
- Tạo món ăn mới
- Sửa thông tin món ăn (tên, giá, mô tả)
- Xóa món ăn
- Cập nhật trạng thái toàn cục

## Cấu Trúc Database

### Bảng `menu_items`
```sql
CREATE TABLE menu_items (
    id UUID PRIMARY KEY,
    restaurant_id UUID NOT NULL,
    branch_id UUID,
    category_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    description TEXT,
    image_url TEXT,
    available BOOLEAN DEFAULT TRUE,  -- Trạng thái toàn cục (Owner quản lý)
    ...
);
```

### Bảng `menu_item_availability`
```sql
CREATE TABLE menu_item_availability (
    id UUID PRIMARY KEY,
    menu_item_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,  -- Trạng thái theo chi nhánh (Manager quản lý)
    reason TEXT,                        -- Lý do tắt món
    updated_at TIMESTAMP,
    UNIQUE(menu_item_id, branch_id)
);
```

## API Endpoints

### 1. Tạo Món Ăn (Owner Only)
```http
POST /api/v1/menu-items
Authorization: Bearer <owner_token>

{
  "categoryId": "uuid",
  "name": "Phở Bò",
  "description": "Phở bò truyền thống",
  "price": 50000,
  "imageUrl": "https://...",
  "available": true
}
```

### 2. Cập Nhật Món Ăn (Owner Only)
```http
PUT /api/v1/menu-items/:id
Authorization: Bearer <owner_token>

{
  "name": "Phở Bò Đặc Biệt",
  "price": 60000,
  "description": "Phở bò với thịt đặc biệt"
}
```

### 3. Xóa Món Ăn (Owner Only)
```http
DELETE /api/v1/menu-items/:id
Authorization: Bearer <owner_token>
```

### 4. Cập Nhật Trạng Thái Toàn Cục (Owner Only)
```http
PATCH /api/v1/menu-items/:id/availability
Authorization: Bearer <owner_token>

{
  "available": false
}
```

### 5. Cập Nhật Trạng Thái Chi Nhánh (Manager Only)
```http
PATCH /api/v1/menu-items/:id/branch-availability
Authorization: Bearer <manager_token>

{
  "available": false,
  "reason": "Hết nguyên liệu"
}
```

## Logic Hiển Thị Món Ăn

Khi khách hàng xem menu tại một chi nhánh, món ăn sẽ hiển thị nếu:
1. `menu_items.available = true` (Owner chưa tắt toàn cục)
2. KHÔNG tồn tại record trong `menu_item_availability` với `is_available = false` cho chi nhánh đó

Nếu Owner tắt món (`available = false`), món sẽ bị ẩn ở TẤT CẢ chi nhánh.
Nếu Manager tắt món tại chi nhánh, món chỉ bị ẩn tại chi nhánh đó.

## Ví Dụ Thực Tế

### Tình huống 1: Owner ngưng phục vụ món
```
Owner tắt món "Phở Gà" toàn hệ thống
→ Món bị ẩn ở TẤT CẢ chi nhánh
```

### Tình huống 2: Manager hết nguyên liệu
```
Manager chi nhánh Quận 1 tắt món "Phở Bò" với lý do "Hết xương bò"
→ Món chỉ bị ẩn tại chi nhánh Quận 1
→ Các chi nhánh khác vẫn phục vụ bình thường
```

### Tình huống 3: Manager bật lại món
```
Manager chi nhánh Quận 1 bật lại món "Phở Bò"
→ Món hiển thị trở lại tại chi nhánh Quận 1
```

## Files Liên Quan

- `src/use-cases/menu-item/create-menu-item.js` - Tạo món (Owner only)
- `src/use-cases/menu-item/update-menu-item.js` - Sửa món (Owner only)
- `src/use-cases/menu-item/delete-menu-item.js` - Xóa món (Owner only)
- `src/use-cases/menu-item/update-availability.js` - Cập nhật trạng thái toàn cục (Owner only)
- `src/use-cases/menu-item/update-branch-availability.js` - Cập nhật trạng thái chi nhánh (Manager only)
- `src/repository/menu-item-availability.js` - Repository cho bảng menu_item_availability
- `src/dto/menu-item/update-branch-availability.js` - DTO cho endpoint manager
