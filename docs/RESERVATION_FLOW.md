# FLOW ĐẶT BÀN HOÀN CHỈNH

## 📱 FLOW 1: KHÁCH ĐẶT QUA WEBSITE/APP (Online Booking)

### Bước 1: Khách đặt bàn
- Khách vào website nhà hàng
- Chọn: Date, Time, Number of guests
- Điền: Name, Phone, Email (optional)
- Thêm special requests (optional)
- Click "Book Table"

### Bước 2: System xử lý
- **Check availability**: System tự động check xem có bàn trống không
- **Auto-assign table** (nếu có logic):
  - Tìm bàn phù hợp với số khách
  - Bàn available trong time slot đó
  - Tự động gán table_id vào reservation
- **Tạo reservation**: Status = PENDING
- **Gửi confirmation**: Email/SMS cho khách (nếu có tích hợp)

### Bước 3: Staff xử lý
- Staff thấy reservation mới trong tab "Pending"
- Staff xem chi tiết:
  - ✅ Bàn đã được gán tự động → Chỉ cần confirm
  - ❌ Bàn chưa được gán → Staff assign table thủ công
- Staff click "Confirm" → Status: CONFIRMED
- (Optional) Gửi confirmation message cho khách

---

## ☎️ FLOW 2: KHÁCH GỌI ĐIỆN ĐẶT BÀN (Phone Booking)

### Bước 1: Khách gọi điện
- Khách: "Tôi muốn đặt bàn cho 4 người, 7pm tối nay"
- Staff: "Vâng, cho tôi xin tên và số điện thoại"

### Bước 2: Staff tạo reservation
- Staff mở Staff Portal → Reservations
- Click "New Reservation"
- Điền thông tin khách đang nói:
  - Name, Phone
  - Date: Today, Time: 7:00 PM
  - Party size: 4 guests
  - Special requests (nếu khách yêu cầu)

### Bước 3: Staff assign table ngay
- Trong dialog "New Reservation", có option "Assign Table"
- Staff chọn bàn phù hợp (capacity ≥ 4, available)
- Click "Create Reservation"
- Status: CONFIRMED (không cần pending vì đã xác nhận qua điện thoại)

### Bước 4: Staff confirm với khách
- Staff: "Dạ, tôi đã đặt bàn Table 5 cho quý khách lúc 7pm. Xin cảm ơn!"

---

## 🚶 FLOW 3: KHÁCH WALK-IN (Đến trực tiếp không đặt trước)

### Bước 1: Khách đến nhà hàng
- Khách: "Cho tôi bàn 2 người"
- Staff check bàn trống

### Bước 2: Staff tạo reservation nhanh (optional)
- Có thể tạo reservation để tracking
- Hoặc chỉ update table status: AVAILABLE → OCCUPIED

### Bước 3: Dẫn khách vào bàn
- Staff dẫn khách đến bàn
- Update table status → OCCUPIED

---

## ✅ FLOW 4: KHÁCH ĐẾN THEO RESERVATION (Check-in)

### Bước 1: Khách đến đúng giờ
- Khách: "Tôi có đặt bàn tên Nguyễn Văn A"

### Bước 2: Staff check reservation
- Staff search by name hoặc phone
- Tìm thấy reservation: Status CONFIRMED, Table 5
- Verify thông tin

### Bước 3: Dẫn khách vào bàn
- Staff: "Vâng, bàn của quý khách là Table 5, mời quý khách"
- Dẫn khách vào bàn
- Update table status: AVAILABLE → OCCUPIED (trong Table Management)

### Bước 4: Khách dùng bữa
- Khách order món, ăn uống...
- (Không cần làm gì với reservation)

### Bước 5: Khách thanh toán và rời đi
- Khách thanh toán xong
- Staff làm 2 việc:
  1. Mark reservation as Completed: CONFIRMED → COMPLETED
  2. Update table status: OCCUPIED → AVAILABLE

---

## ❌ FLOW 5: KHÁCH HỦY ĐẶT BÀN

### Scenario A: Khách gọi hủy trước
- Khách gọi: "Tôi muốn hủy đặt bàn"
- Staff tìm reservation
- Click "Cancel" → Status: CANCELLED
- Table được free up (nếu đã assign)

### Scenario B: Khách không đến (No-show)
- Đã quá giờ đặt 15-30 phút
- Khách không đến, không gọi
- Staff click "Cancel" → Status: CANCELLED
- Ghi chú: "No-show"
- Table được free up

---

## 📊 TỔNG KẾT FLOW

### ONLINE BOOKING:
```
Customer → Website → System auto-assign table → PENDING 
→ Staff confirm → CONFIRMED 
→ Customer arrives → OCCUPIED 
→ Customer leaves → COMPLETED + AVAILABLE
```

### PHONE BOOKING:
```
Customer calls → Staff creates + assigns table → CONFIRMED 
→ Customer arrives → OCCUPIED 
→ Customer leaves → COMPLETED + AVAILABLE
```

### WALK-IN:
```
Customer arrives → Staff assigns table → OCCUPIED 
→ Customer leaves → AVAILABLE
(Optional: Create reservation for tracking)
```

---

## 🔑 ĐIỂM QUAN TRỌNG

### 1. Auto-assign table (Online booking)
- **Nếu có logic**: System tự assign table khi khách đặt online
- **Nếu không có**: Staff phải assign thủ công sau khi confirm

### 2. Status flow
```
PENDING (online booking)
  ↓ staff confirm
CONFIRMED (đã xác nhận)
  ↓ customer arrives (không update reservation, chỉ update table)
(Table: OCCUPIED)
  ↓ customer leaves
COMPLETED (hoàn thành)
(Table: AVAILABLE)
```

### 3. Reservation vs Table Status
- **Reservation status**: PENDING → CONFIRMED → COMPLETED
- **Table status**: AVAILABLE → OCCUPIED → AVAILABLE
- Hai cái này độc lập nhưng liên quan

### 4. Khi nào update gì
- **Confirm reservation**: Chỉ update reservation status
- **Customer arrives**: Update table status → OCCUPIED
- **Customer leaves**: Update cả 2:
  - Reservation → COMPLETED
  - Table → AVAILABLE

---

## 🎯 API ENDPOINTS

### Reservations
- `GET /api/v1/branches/:branchId/reservations` - List all reservations
- `POST /api/v1/branches/:branchId/reservations` - Create new reservation
- `PATCH /api/v1/branches/:branchId/reservations/:id` - Update reservation status
- `POST /api/v1/branches/:branchId/reservations/:id/assign-table` - Assign table
- `POST /api/v1/branches/:branchId/reservations/:id/complete` - Complete reservation (frees table)

### Tables
- `GET /api/v1/branches/:branchId/tables` - List all tables
- `PATCH /api/v1/branches/:branchId/tables/:id` - Update table status

---

## 💡 TIPS CHO STAFF

1. **Pending reservations**: Luôn check và confirm sớm để khách yên tâm
2. **Phone bookings**: Assign table ngay khi tạo để tránh quên
3. **Walk-ins**: Có thể tạo reservation để tracking hoặc chỉ update table
4. **Check-in**: Verify thông tin khách trước khi dẫn vào bàn
5. **Complete**: Nhớ mark completed khi khách rời đi để free table
6. **No-show**: Cancel reservation nếu khách không đến sau 15-30 phút
