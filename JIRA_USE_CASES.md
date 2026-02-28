# QR Service Platform - Use Cases Breakdown for Jira

## 📋 Tổng quan

**Tổng số Use Cases:** 76 use cases  
**Ước tính:** ~3-5 story points/use case  
**Tổng effort:** ~300-400 story points

---

## 🏢 Module 1: AUTHENTICATION & AUTHORIZATION (8 use cases)

### Epic: AUTH-001 - User Authentication
**Priority:** CRITICAL | **Effort:** 40 SP

| Ticket | Use Case | Description | Dependencies | Effort |
|--------|----------|-------------|--------------|--------|
| AUTH-101 | RegisterRestaurantUseCase | Đăng ký nhà hàng mới (Owner) | - | 5 SP |
| AUTH-102 | LoginUseCase | Đăng nhập với email/password | - | 3 SP |
| AUTH-103 | RefreshTokenUseCase | Làm mới access token | AUTH-102 | 3 SP |
| AUTH-104 | LogoutUseCase | Đăng xuất và invalidate token | AUTH-102 | 2 SP |
| AUTH-105 | ForgotPasswordUseCase | Gửi email reset password | - | 3 SP |
| AUTH-106 | ResetPasswordUseCase | Reset password với token | AUTH-105 | 3 SP |
| AUTH-107 | ChangePasswordUseCase | Đổi password khi đã login | AUTH-102 | 2 SP |
| AUTH-108 | VerifyEmailUseCase | Xác thực email sau đăng ký | AUTH-101 | 3 SP |

---

## 🏪 Module 2: RESTAURANT MANAGEMENT (6 use cases)

### Epic: REST-001 - Restaurant Setup
**Priority:** HIGH | **Effort:** 30 SP

| Ticket | Use Case | Description | Dependencies | Effort |
|--------|----------|-------------|--------------|--------|
| REST-101 | CreateRestaurantUseCase | Tạo nhà hàng mới | AUTH-101 | 5 SP |
| REST-102 | UpdateRestaurantUseCase | Cập nhật thông tin nhà hàng | REST-101 | 3 SP |
| REST-103 | GetRestaurantDetailsUseCase | Xem chi tiết nhà hàng | REST-101 | 2 SP |
| REST-104 | UploadRestaurantLogoUseCase | Upload logo nhà hàng | REST-101 | 3 SP |
| REST-105 | GetRestaurantStatisticsUseCase | Thống kê tổng quan nhà hàng | REST-101 | 5 SP |
| REST-106 | DeleteRestaurantUseCase | Xóa nhà hàng (soft delete) | REST-101 | 2 SP |

---

## 🏢 Module 3: BRANCH MANAGEMENT (7 use cases)

### Epic: BRANCH-001 - Branch Operations
**Priority:** HIGH | **Effort:** 35 SP

| Ticket | Use Case | Description | Dependencies | Effort |
|--------|----------|-------------|--------------|--------|
| BRANCH-101 | CreateBranchUseCase | Tạo chi nhánh mới | REST-101 | 5 SP |
| BRANCH-102 | UpdateBranchUseCase | Cập nhật thông tin chi nhánh | BRANCH-101 | 3 SP |
| BRANCH-103 | GetBranchDetailsUseCase | Xem chi tiết chi nhánh | BRANCH-101 | 2 SP |
| BRANCH-104 | ListBranchesUseCase | Danh sách chi nhánh (pagination) | BRANCH-101 | 3 SP |
| BRANCH-105 | DeleteBranchUseCase | Xóa chi nhánh | BRANCH-101 | 3 SP |
| BRANCH-106 | GetBranchStatisticsUseCase | Thống kê chi nhánh | BRANCH-101 | 5 SP |
| BRANCH-107 | SetBranchStatusUseCase | Đóng/mở chi nhánh | BRANCH-101 | 2 SP |

---

## 🪑 Module 4: TABLE & AREA MANAGEMENT (10 use cases)

### Epic: TABLE-001 - Table Operations
**Priority:** CRITICAL | **Effort:** 50 SP

| Ticket | Use Case | Description | Dependencies | Effort |
|--------|----------|-------------|--------------|--------|
| TABLE-101 | CreateAreaUseCase | Tạo khu vực (Main, VIP, Outdoor) | BRANCH-101 | 3 SP |
| TABLE-102 | UpdateAreaUseCase | Cập nhật khu vực | TABLE-101 | 2 SP |
| TABLE-103 | DeleteAreaUseCase | Xóa khu vực | TABLE-101 | 2 SP |
| TABLE-104 | CreateTableUseCase | Tạo bàn với QR code | TABLE-101 | 5 SP |
| TABLE-105 | UpdateTableUseCase | Cập nhật thông tin bàn | TABLE-104 | 3 SP |
| TABLE-106 | DeleteTableUseCase | Xóa bàn | TABLE-104 | 2 SP |
| TABLE-107 | GenerateTableQRUseCase | Tạo/tái tạo QR code cho bàn | TABLE-104 | 5 SP |
| TABLE-108 | GetTableByQRUseCase | Lấy thông tin bàn qua QR | TABLE-107 | 3 SP |
| TABLE-109 | UpdateTableStatusUseCase | Cập nhật trạng thái bàn | TABLE-104 | 3 SP |
| TABLE-110 | MergeTablesUseCase | Gộp bàn (split bill) | TABLE-104 | 8 SP |

---

## 🍽️ Module 5: MENU MANAGEMENT (12 use cases)

### Epic: MENU-001 - Menu Operations
**Priority:** CRITICAL | **Effort:** 60 SP

| Ticket | Use Case | Description | Dependencies | Effort |
|--------|----------|-------------|--------------|--------|
| MENU-101 | CreateCategoryUseCase | Tạo danh mục món | BRANCH-101 | 3 SP |
| MENU-102 | UpdateCategoryUseCase | Cập nhật danh mục | MENU-101 | 2 SP |
| MENU-103 | DeleteCategoryUseCase | Xóa danh mục | MENU-101 | 2 SP |
| MENU-104 | CreateMenuItemUseCase | Tạo món ăn | MENU-101 | 5 SP |
| MENU-105 | UpdateMenuItemUseCase | Cập nhật món ăn | MENU-104 | 3 SP |
| MENU-106 | DeleteMenuItemUseCase | Xóa món ăn | MENU-104 | 2 SP |
| MENU-107 | UploadMenuItemImageUseCase | Upload hình món ăn | MENU-104 | 5 SP |
| MENU-108 | GetFullMenuByBranchUseCase | Lấy menu đầy đủ theo chi nhánh | MENU-104 | 5 SP |
| MENU-109 | UpdateMenuItemAvailabilityUseCase | Cập nhật tình trạng món (hết hàng) | MENU-104 | 3 SP |
| MENU-110 | CreateCustomizationGroupUseCase | Tạo nhóm tùy chọn (size, topping) | MENU-104 | 5 SP |
| MENU-111 | AddCustomizationOptionUseCase | Thêm tùy chọn vào nhóm | MENU-110 | 3 SP |
| MENU-112 | SearchMenuItemsUseCase | Tìm kiếm món ăn | MENU-104 | 5 SP |

---

## 🛒 Module 6: ORDER MANAGEMENT (10 use cases)

### Epic: ORDER-001 - Order Lifecycle
**Priority:** CRITICAL | **Effort:** 55 SP

| Ticket | Use Case | Description | Dependencies | Effort |
|--------|----------|-------------|--------------|--------|
| ORDER-101 | CreateOrderUseCase | Tạo đơn hàng từ QR | TABLE-108, MENU-108 | 8 SP |
| ORDER-102 | GetOrderDetailsUseCase | Xem chi tiết đơn hàng | ORDER-101 | 3 SP |
| ORDER-103 | UpdateOrderStatusUseCase | Cập nhật trạng thái đơn | ORDER-101 | 5 SP |
| ORDER-104 | AddItemsToOrderUseCase | Thêm món vào đơn đang mở | ORDER-101 | 5 SP |
| ORDER-105 | RemoveItemFromOrderUseCase | Xóa món khỏi đơn | ORDER-101 | 3 SP |
| ORDER-106 | UpdateOrderItemUseCase | Cập nhật số lượng món | ORDER-101 | 3 SP |
| ORDER-107 | CancelOrderUseCase | Hủy đơn hàng | ORDER-101 | 5 SP |
| ORDER-108 | GetActiveOrdersByBranchUseCase | Danh sách đơn đang hoạt động | ORDER-101 | 3 SP |
| ORDER-109 | GetOrdersByTableUseCase | Lịch sử đơn theo bàn | ORDER-101 | 3 SP |
| ORDER-110 | GetOrderLifecycleUseCase | Xem lịch sử thay đổi đơn | ORDER-101 | 5 SP |

---

## 💳 Module 7: PAYMENT MANAGEMENT (8 use cases)

### Epic: PAYMENT-001 - Payment Processing
**Priority:** CRITICAL | **Effort:** 45 SP

| Ticket | Use Case | Description | Dependencies | Effort |
|--------|----------|-------------|--------------|--------|
| PAYMENT-101 | ProcessPaymentUseCase | Xử lý thanh toán (ACID safe) | ORDER-101 | 8 SP |
| PAYMENT-102 | VerifyPaymentWebhookUseCase | Xác thực webhook từ PayOS | PAYMENT-101 | 5 SP |
| PAYMENT-103 | GetPaymentDetailsUseCase | Xem chi tiết thanh toán | PAYMENT-101 | 3 SP |
| PAYMENT-104 | RefundPaymentUseCase | Hoàn tiền | PAYMENT-101 | 8 SP |
| PAYMENT-105 | GetPaymentHistoryUseCase | Lịch sử thanh toán | PAYMENT-101 | 3 SP |
| PAYMENT-106 | GetPaymentStatisticsUseCase | Thống kê thanh toán | PAYMENT-101 | 5 SP |
| PAYMENT-107 | RetryFailedPaymentUseCase | Thử lại thanh toán thất bại | PAYMENT-101 | 5 SP |
| PAYMENT-108 | GenerateInvoiceUseCase | Tạo hóa đơn | PAYMENT-101 | 5 SP |

---

## 📅 Module 8: RESERVATION MANAGEMENT (7 use cases)

### Epic: RESERVATION-001 - Booking System
**Priority:** MEDIUM | **Effort:** 35 SP

| Ticket | Use Case | Description | Dependencies | Effort |
|--------|----------|-------------|--------------|--------|
| RESERVATION-101 | CreateReservationUseCase | Đặt bàn online | TABLE-104 | 5 SP |
| RESERVATION-102 | UpdateReservationUseCase | Cập nhật đặt bàn | RESERVATION-101 | 3 SP |
| RESERVATION-103 | CancelReservationUseCase | Hủy đặt bàn | RESERVATION-101 | 3 SP |
| RESERVATION-104 | ConfirmReservationUseCase | Xác nhận đặt bàn | RESERVATION-101 | 3 SP |
| RESERVATION-105 | GetReservationDetailsUseCase | Xem chi tiết đặt bàn | RESERVATION-101 | 2 SP |
| RESERVATION-106 | ListReservationsUseCase | Danh sách đặt bàn | RESERVATION-101 | 3 SP |
| RESERVATION-107 | CheckTableAvailabilityUseCase | Kiểm tra bàn trống | TABLE-104 | 5 SP |

---

## 🔔 Module 9: SERVICE REQUEST (6 use cases)

### Epic: SERVICE-001 - Customer Service
**Priority:** HIGH | **Effort:** 30 SP

| Ticket | Use Case | Description | Dependencies | Effort |
|--------|----------|-------------|--------------|--------|
| SERVICE-101 | CreateServiceRequestUseCase | Tạo yêu cầu phục vụ | TABLE-108 | 5 SP |
| SERVICE-102 | AcknowledgeServiceRequestUseCase | Staff xác nhận yêu cầu | SERVICE-101 | 3 SP |
| SERVICE-103 | ResolveServiceRequestUseCase | Hoàn thành yêu cầu | SERVICE-101 | 3 SP |
| SERVICE-104 | GetPendingRequestsByBranchUseCase | Danh sách yêu cầu chờ xử lý | SERVICE-101 | 3 SP |
| SERVICE-105 | AssignRequestToStaffUseCase | Gán yêu cầu cho nhân viên | SERVICE-101 | 3 SP |
| SERVICE-106 | GetServiceRequestStatisticsUseCase | Thống kê yêu cầu phục vụ | SERVICE-101 | 5 SP |

---

## 👥 Module 10: USER & STAFF MANAGEMENT (8 use cases)

### Epic: USER-001 - Staff Operations
**Priority:** HIGH | **Effort:** 40 SP

| Ticket | Use Case | Description | Dependencies | Effort |
|--------|----------|-------------|--------------|--------|
| USER-101 | CreateStaffUseCase | Tạo tài khoản nhân viên | BRANCH-101 | 5 SP |
| USER-102 | UpdateStaffUseCase | Cập nhật thông tin nhân viên | USER-101 | 3 SP |
| USER-103 | DeleteStaffUseCase | Xóa nhân viên | USER-101 | 2 SP |
| USER-104 | AssignStaffToBranchUseCase | Gán nhân viên vào chi nhánh | USER-101 | 3 SP |
| USER-105 | UpdateStaffRoleUseCase | Thay đổi vai trò nhân viên | USER-101 | 3 SP |
| USER-106 | GetStaffListUseCase | Danh sách nhân viên | USER-101 | 3 SP |
| USER-107 | GetStaffActivityLogUseCase | Xem lịch sử hoạt động | USER-101 | 5 SP |
| USER-108 | SetStaffStatusUseCase | Kích hoạt/vô hiệu hóa nhân viên | USER-101 | 2 SP |

---

## 💰 Module 11: SUBSCRIPTION MANAGEMENT (6 use cases)

### Epic: SUBSCRIPTION-001 - Plan Management
**Priority:** HIGH | **Effort:** 30 SP

| Ticket | Use Case | Description | Dependencies | Effort |
|--------|----------|-------------|--------------|--------|
| SUBSCRIPTION-101 | CreateSubscriptionUseCase | Tạo subscription mới | REST-101 | 5 SP |
| SUBSCRIPTION-102 | UpgradeSubscriptionUseCase | Nâng cấp gói | SUBSCRIPTION-101 | 5 SP |
| SUBSCRIPTION-103 | CancelSubscriptionUseCase | Hủy subscription | SUBSCRIPTION-101 | 3 SP |
| SUBSCRIPTION-104 | RenewSubscriptionUseCase | Gia hạn subscription | SUBSCRIPTION-101 | 5 SP |
| SUBSCRIPTION-105 | GetSubscriptionDetailsUseCase | Xem chi tiết gói | SUBSCRIPTION-101 | 2 SP |
| SUBSCRIPTION-106 | CheckFeatureLimitUseCase | Kiểm tra giới hạn tính năng | SUBSCRIPTION-101 | 3 SP |

---

## ⭐ Module 12: FEEDBACK & RATING (5 use cases)

### Epic: FEEDBACK-001 - Customer Feedback
**Priority:** MEDIUM | **Effort:** 25 SP

| Ticket | Use Case | Description | Dependencies | Effort |
|--------|----------|-------------|--------------|--------|
| FEEDBACK-101 | CreateFeedbackUseCase | Tạo đánh giá sau bữa ăn | ORDER-101 | 5 SP |
| FEEDBACK-102 | GetFeedbacksByRestaurantUseCase | Danh sách đánh giá | FEEDBACK-101 | 3 SP |
| FEEDBACK-103 | RespondToFeedbackUseCase | Phản hồi đánh giá | FEEDBACK-101 | 3 SP |
| FEEDBACK-104 | GetFeedbackStatisticsUseCase | Thống kê đánh giá | FEEDBACK-101 | 5 SP |
| FEEDBACK-105 | GetDishRatingsUseCase | Đánh giá theo món ăn | FEEDBACK-101 | 3 SP |

---

## 📊 Module 13: ANALYTICS & REPORTING (8 use cases)

### Epic: ANALYTICS-001 - Business Intelligence
**Priority:** MEDIUM | **Effort:** 40 SP

| Ticket | Use Case | Description | Dependencies | Effort |
|--------|----------|-------------|--------------|--------|
| ANALYTICS-101 | GetDashboardOverviewUseCase | Tổng quan dashboard | ORDER-101, PAYMENT-101 | 8 SP |
| ANALYTICS-102 | GetRevenueReportUseCase | Báo cáo doanh thu | PAYMENT-101 | 5 SP |
| ANALYTICS-103 | GetPopularItemsUseCase | Món bán chạy | ORDER-101 | 5 SP |
| ANALYTICS-104 | GetPeakHoursAnalyticsUseCase | Phân tích giờ cao điểm | ORDER-101 | 5 SP |
| ANALYTICS-105 | GetTableTurnoverRateUseCase | Tỷ lệ luân chuyển bàn | ORDER-101 | 5 SP |
| ANALYTICS-106 | GetStaffPerformanceUseCase | Hiệu suất nhân viên | SERVICE-101 | 5 SP |
| ANALYTICS-107 | ExportReportUseCase | Xuất báo cáo (Excel/PDF) | ANALYTICS-101 | 5 SP |
| ANALYTICS-108 | GetCustomerBehaviorUseCase | Phân tích hành vi khách | ORDER-101 | 5 SP |

---

## 🔔 Module 14: NOTIFICATION (4 use cases)

### Epic: NOTIFICATION-001 - Alert System
**Priority:** MEDIUM | **Effort:** 20 SP

| Ticket | Use Case | Description | Dependencies | Effort |
|--------|----------|-------------|--------------|--------|
| NOTIFICATION-101 | SendOrderNotificationUseCase | Thông báo đơn hàng mới | ORDER-101 | 5 SP |
| NOTIFICATION-102 | SendPaymentNotificationUseCase | Thông báo thanh toán | PAYMENT-101 | 5 SP |
| NOTIFICATION-103 | SendServiceRequestNotificationUseCase | Thông báo yêu cầu phục vụ | SERVICE-101 | 5 SP |
| NOTIFICATION-104 | GetNotificationHistoryUseCase | Lịch sử thông báo | - | 3 SP |

---

## 🎯 PRIORITY MATRIX

### P0 - CRITICAL (Must have for MVP)
**Total: 38 use cases | 210 SP**

```
✅ Authentication (8 use cases)
✅ Table Management (10 use cases)
✅ Menu Management (12 use cases)
✅ Order Management (10 use cases)
✅ Payment Management (8 use cases)
```

### P1 - HIGH (Important for launch)
**Total: 27 use cases | 135 SP**

```
✅ Restaurant Management (6 use cases)
✅ Branch Management (7 use cases)
✅ Service Request (6 use cases)
✅ User Management (8 use cases)
✅ Subscription (6 use cases)
```

### P2 - MEDIUM (Nice to have)
**Total: 17 use cases | 85 SP**

```
✅ Reservation (7 use cases)
✅ Feedback (5 use cases)
✅ Analytics (8 use cases)
✅ Notification (4 use cases)
```

---

## 📅 SPRINT PLANNING SUGGESTION

### Sprint 1-2: Foundation (2 weeks)
- AUTH-001: Authentication (8 use cases)
- REST-001: Restaurant Setup (6 use cases)
- BRANCH-001: Branch Operations (7 use cases)

### Sprint 3-4: Core Features (2 weeks)
- TABLE-001: Table Operations (10 use cases)
- MENU-001: Menu Operations (12 use cases)

### Sprint 5-6: Order Flow (2 weeks)
- ORDER-001: Order Lifecycle (10 use cases)
- PAYMENT-001: Payment Processing (8 use cases)

### Sprint 7-8: Service & Staff (2 weeks)
- SERVICE-001: Customer Service (6 use cases)
- USER-001: Staff Operations (8 use cases)
- SUBSCRIPTION-001: Plan Management (6 use cases)

### Sprint 9-10: Enhancement (2 weeks)
- RESERVATION-001: Booking System (7 use cases)
- FEEDBACK-001: Customer Feedback (5 use cases)
- ANALYTICS-001: Business Intelligence (8 use cases)
- NOTIFICATION-001: Alert System (4 use cases)

---

## 📝 JIRA EPIC STRUCTURE

```
QR-SERVICE-PLATFORM
├── AUTH-001: Authentication & Authorization
├── REST-001: Restaurant Management
├── BRANCH-001: Branch Management
├── TABLE-001: Table & Area Management
├── MENU-001: Menu Management
├── ORDER-001: Order Management
├── PAYMENT-001: Payment Management
├── RESERVATION-001: Reservation Management
├── SERVICE-001: Service Request
├── USER-001: User & Staff Management
├── SUBSCRIPTION-001: Subscription Management
├── FEEDBACK-001: Feedback & Rating
├── ANALYTICS-001: Analytics & Reporting
└── NOTIFICATION-001: Notification System
```

---

## 🎯 TEAM ALLOCATION SUGGESTION

### Team 1: Backend Core (3 devs)
- Authentication
- Restaurant/Branch Management
- User Management

### Team 2: Order Flow (3 devs)
- Table Management
- Menu Management
- Order Management

### Team 3: Payment & Finance (2 devs)
- Payment Processing
- Subscription Management
- Invoice Generation

### Team 4: Customer Experience (2 devs)
- Service Request
- Reservation
- Feedback

### Team 5: Analytics & Reporting (2 devs)
- Dashboard
- Reports
- Analytics

---

**Total Effort:** ~430 Story Points  
**Team Size:** 12 developers  
**Estimated Duration:** 10 sprints (20 weeks / 5 months)  
**Target:** Production-ready SaaS platform

---

**Created:** 2024  
**Version:** 1.0  
**Status:** Ready for Jira Import
