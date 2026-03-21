# Reservation Module

Module quản lý đặt bàn nhà hàng.

## Use Cases

### RESERVATION-101: CreateReservationUseCase
Tạo đặt bàn mới cho khách hàng.

**Endpoint:** `POST /api/v1/reservations`

**Request Body:**
```json
{
  "branchId": "string",
  "tableId": "string",
  "customerName": "string",
  "customerPhone": "string",
  "customerEmail": "string (optional)",
  "partySize": number,
  "reservationDate": "YYYY-MM-DD",
  "reservationTime": "HH:MM",
  "notes": "string (optional)"
}
```

**Business Rules:**
- Branch phải tồn tại
- Table phải tồn tại
- Table capacity >= party size
- Bàn chưa bị đặt trong cùng thời gian
- Status mặc định: PENDING

---

### RESERVATION-102: UpdateReservationUseCase
Cập nhật thông tin đặt bàn.

**Endpoint:** `PUT /api/v1/reservations/:id`

**Request Body:**
```json
{
  "partySize": number (optional),
  "reservationDate": "YYYY-MM-DD (optional)",
  "reservationTime": "HH:MM (optional)",
  "notes": "string (optional)"
}
```

**Business Rules:**
- Reservation phải tồn tại
- Reservation chưa bị hủy
- Nếu đổi thời gian/số khách: kiểm tra bàn còn trống

---

### RESERVATION-103: CancelReservationUseCase
Hủy đặt bàn.

**Endpoint:** `POST /api/v1/reservations/:id/cancel`

**Business Rules:**
- Reservation phải tồn tại
- Reservation chưa bị hủy
- Cập nhật status = CANCELLED

---

### RESERVATION-104: ConfirmReservationUseCase
Staff xác nhận đặt bàn.

**Endpoint:** `POST /api/v1/reservations/:id/confirm`

**Business Rules:**
- Chỉ Staff/Manager/Owner mới confirm được
- Status phải là PENDING
- Cập nhật status = CONFIRMED

---

### RESERVATION-105: GetReservationDetailsUseCase
Xem chi tiết đặt bàn.

**Endpoint:** `GET /api/v1/reservations/:id`

**Response:** Trả về đầy đủ thông tin reservation kèm table và branch.

---

### RESERVATION-106: ListReservationsUseCase
Danh sách đặt bàn theo chi nhánh.

**Endpoint:** `GET /api/v1/reservations?branchId=...&status=...&date=...&page=1&limit=10`

**Query Parameters:**
- branchId (required)
- status (optional): PENDING, CONFIRMED, CANCELLED, COMPLETED
- date (optional): YYYY-MM-DD
- page (optional, default: 1)
- limit (optional, default: 10)

**Business Rules:**
- Staff chỉ xem được reservation của chi nhánh mình

---

### RESERVATION-107: CheckTableAvailabilityUseCase
Kiểm tra bàn trống.

**Endpoint:** `GET /api/v1/reservations/check-availability?branchId=...&reservationDate=...&reservationTime=...&partySize=...`

**Query Parameters:**
- branchId (required)
- reservationDate (required): YYYY-MM-DD
- reservationTime (required): HH:MM
- partySize (required): number

**Response:**
```json
{
  "available": boolean,
  "tables": [...]
}
```

## Database Tables

- `reservations`: Lưu thông tin đặt bàn
- `tables`: Thông tin bàn
- `areas`: Khu vực bàn
- `branches`: Chi nhánh nhà hàng

## Status Flow

```
PENDING → CONFIRMED → COMPLETED
   ↓
CANCELLED
```
