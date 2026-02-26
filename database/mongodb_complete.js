// =====================================================
// QR Service Platform - MongoDB Complete Schema
// =====================================================

// Connect to database
use qr_service_platform;

// =====================================================
// 1️⃣ ORDER EVENTS COLLECTION
// =====================================================

db.createCollection("order_events");

// Indexes
db.order_events.createIndex({ order_id: 1, timestamp: -1 });
db.order_events.createIndex({ table_id: 1, timestamp: -1 });
db.order_events.createIndex({ restaurant_id: 1, timestamp: -1 });
db.order_events.createIndex({ action: 1, timestamp: -1 });
db.order_events.createIndex({ timestamp: -1 });

// TTL index - auto delete after 90 days
db.order_events.createIndex(
  { timestamp: 1 },
  { expireAfterSeconds: 7776000 }
);

// Example Document
/*
{
  order_id: "uuid",
  table_id: "uuid",
  restaurant_id: "uuid",
  branch_id: "uuid",
  action: "ITEM_ADDED",
  performed_by: "customer_session_123",
  timestamp: new Date(),
  details: {
    item_id: "uuid",
    item_name: "Phở bò",
    quantity: 2,
    price: 85000
  },
  metadata: {
    ip_address: "192.168.1.1",
    user_agent: "Mozilla/5.0..."
  }
}
*/

print("✅ order_events collection created");

// =====================================================
// 2️⃣ SERVICE REQUESTS COLLECTION
// =====================================================

db.createCollection("service_requests");

// Indexes
db.service_requests.createIndex({ restaurant_id: 1, status: 1, created_at: -1 });
db.service_requests.createIndex({ branch_id: 1, status: 1, created_at: -1 });
db.service_requests.createIndex({ table_id: 1, status: 1 });
db.service_requests.createIndex({ assigned_to: 1, status: 1 });
db.service_requests.createIndex({ status: 1, created_at: 1 });

// TTL index - auto delete after 24 hours
db.service_requests.createIndex(
  { created_at: 1 },
  { expireAfterSeconds: 86400 }
);

// Example Document
/*
{
  restaurant_id: "uuid",
  branch_id: "uuid",
  table_id: "uuid",
  session_id: "uuid",
  request_type: "CALL_STAFF",
  status: "PENDING",
  priority: "NORMAL",
  message: "Cần thêm nước",
  assigned_to: "uuid",
  created_at: new Date(),
  acknowledged_at: null,
  resolved_at: null,
  response_time_seconds: null
}
*/

print("✅ service_requests collection created");

// =====================================================
// 3️⃣ FEEDBACKS COLLECTION
// =====================================================

db.createCollection("feedbacks");

// Indexes
db.feedbacks.createIndex({ restaurant_id: 1, created_at: -1 });
db.feedbacks.createIndex({ branch_id: 1, created_at: -1 });
db.feedbacks.createIndex({ order_id: 1 });
db.feedbacks.createIndex({ overall_rating: 1, created_at: -1 });
db.feedbacks.createIndex({ "dish_ratings.item_id": 1 });
db.feedbacks.createIndex({ tags: 1 });
db.feedbacks.createIndex({ sentiment: 1, created_at: -1 });

// Text search index
db.feedbacks.createIndex(
  { comment: "text", "dish_ratings.note": "text" },
  { default_language: "english" }
);

// Example Document
/*
{
  order_id: "uuid",
  restaurant_id: "uuid",
  branch_id: "uuid",
  table_id: "uuid",
  session_id: "uuid",
  overall_rating: 5,
  food_rating: 5,
  service_rating: 4,
  ambiance_rating: 5,
  comment: "Đồ ăn rất ngon, phục vụ nhiệt tình",
  dish_ratings: [
    {
      item_id: "uuid",
      item_name: "Phở bò",
      rating: 5,
      note: "Nước dùng đậm đà"
    },
    {
      item_id: "uuid",
      item_name: "Nem rán",
      rating: 4,
      note: "Giòn tan"
    }
  ],
  images: [
    "https://cloudinary.com/image1.jpg",
    "https://cloudinary.com/image2.jpg"
  ],
  tags: ["delicious", "fast_service", "clean"],
  is_anonymous: false,
  customer_name: "Nguyễn Văn A",
  customer_email: "customer@example.com",
  response: {
    message: "Cảm ơn quý khách đã ủng hộ",
    responded_by: "uuid",
    responded_at: new Date()
  },
  created_at: new Date(),
  sentiment: "POSITIVE"
}
*/

print("✅ feedbacks collection created");

// =====================================================
// 4️⃣ ACTIVITY LOGS COLLECTION
// =====================================================

db.createCollection("activity_logs");

// Indexes
db.activity_logs.createIndex({ restaurant_id: 1, timestamp: -1 });
db.activity_logs.createIndex({ user_id: 1, timestamp: -1 });
db.activity_logs.createIndex({ entity: 1, entity_id: 1, timestamp: -1 });
db.activity_logs.createIndex({ action: 1, timestamp: -1 });
db.activity_logs.createIndex({ severity: 1, timestamp: -1 });

// TTL index - auto delete after 1 year
db.activity_logs.createIndex(
  { timestamp: 1 },
  { expireAfterSeconds: 31536000 }
);

// Example Document
/*
{
  user_id: "uuid",
  restaurant_id: "uuid",
  branch_id: "uuid",
  action: "UPDATE_MENU_PRICE",
  entity: "menu_items",
  entity_id: "uuid",
  old_value: {
    price: 45000,
    name: "Phở bò"
  },
  new_value: {
    price: 49000,
    name: "Phở bò"
  },
  ip_address: "192.168.1.1",
  user_agent: "Mozilla/5.0...",
  timestamp: new Date(),
  severity: "INFO"
}
*/

print("✅ activity_logs collection created");

// =====================================================
// 5️⃣ TABLE SESSIONS COLLECTION
// =====================================================

db.createCollection("table_sessions");

// Indexes
db.table_sessions.createIndex({ table_id: 1, started_at: -1 });
db.table_sessions.createIndex({ session_token: 1 }, { unique: true });
db.table_sessions.createIndex({ restaurant_id: 1, started_at: -1 });
db.table_sessions.createIndex({ branch_id: 1, started_at: -1 });

// TTL index - auto delete after 7 days
db.table_sessions.createIndex(
  { ended_at: 1 },
  { expireAfterSeconds: 604800 }
);

// Example Document
/*
{
  table_id: "uuid",
  restaurant_id: "uuid",
  branch_id: "uuid",
  session_token: "token_xyz_123",
  customer_count: 4,
  started_at: new Date(),
  ended_at: null,
  duration_minutes: null,
  events: [
    {
      type: "SCAN_QR",
      timestamp: new Date(),
      details: {}
    },
    {
      type: "VIEW_MENU",
      timestamp: new Date(),
      details: {
        category: "Main Course"
      }
    },
    {
      type: "ADD_ITEM",
      timestamp: new Date(),
      details: {
        item_id: "uuid",
        item_name: "Phở bò",
        quantity: 2
      }
    },
    {
      type: "CALL_STAFF",
      timestamp: new Date(),
      details: {
        request_type: "REQUEST_WATER"
      }
    }
  ],
  device_info: {
    user_agent: "Mozilla/5.0...",
    device_type: "mobile",
    browser: "Chrome",
    os: "Android"
  }
}
*/

print("✅ table_sessions collection created");

// =====================================================
// 6️⃣ REALTIME NOTIFICATIONS COLLECTION
// =====================================================

db.createCollection("realtime_notifications");

// Indexes
db.realtime_notifications.createIndex({ restaurant_id: 1, created_at: -1 });
db.realtime_notifications.createIndex({ branch_id: 1, created_at: -1 });
db.realtime_notifications.createIndex({ type: 1, created_at: -1 });
db.realtime_notifications.createIndex({ is_delivered: 1, created_at: 1 });

// TTL index - auto delete after 1 hour
db.realtime_notifications.createIndex(
  { created_at: 1 },
  { expireAfterSeconds: 3600 }
);

// Example Document
/*
{
  restaurant_id: "uuid",
  branch_id: "uuid",
  type: "NEW_ORDER",
  payload: {
    order_id: "uuid",
    table_name: "Bàn 5",
    table_id: "uuid",
    items_count: 3,
    total_amount: 250000
  },
  target_users: ["uuid1", "uuid2"],
  target_roles: ["Chef", "Staff"],
  created_at: new Date(),
  delivered_at: null,
  is_delivered: false
}
*/

print("✅ realtime_notifications collection created");

// =====================================================
// 7️⃣ ANALYTICS CACHE COLLECTION
// =====================================================

db.createCollection("analytics_cache");

// Indexes
db.analytics_cache.createIndex(
  { restaurant_id: 1, metric_type: 1, period: 1 },
  { unique: true }
);
db.analytics_cache.createIndex({ calculated_at: 1 });

// TTL index - auto delete after 90 days
db.analytics_cache.createIndex(
  { calculated_at: 1 },
  { expireAfterSeconds: 7776000 }
);

// Example Document
/*
{
  restaurant_id: "uuid",
  branch_id: "uuid",
  metric_type: "DAILY_REVENUE",
  period: "2024-01-15",
  data: {
    total_revenue: 5000000,
    total_orders: 45,
    avg_order_value: 111111,
    peak_hour: "12:00",
    popular_items: [
      {
        item_id: "uuid",
        item_name: "Phở bò",
        quantity_sold: 25,
        revenue: 2125000
      }
    ]
  },
  calculated_at: new Date()
}
*/

print("✅ analytics_cache collection created");

// =====================================================
// 8️⃣ CUSTOMER BEHAVIOR TRACKING (Optional)
// =====================================================

db.createCollection("customer_behavior");

// Indexes
db.customer_behavior.createIndex({ session_id: 1 });
db.customer_behavior.createIndex({ restaurant_id: 1, created_at: -1 });
db.customer_behavior.createIndex({ event_type: 1, created_at: -1 });

// TTL index - auto delete after 30 days
db.customer_behavior.createIndex(
  { created_at: 1 },
  { expireAfterSeconds: 2592000 }
);

// Example Document
/*
{
  session_id: "uuid",
  restaurant_id: "uuid",
  branch_id: "uuid",
  table_id: "uuid",
  event_type: "MENU_VIEW",
  event_data: {
    category_id: "uuid",
    category_name: "Main Course",
    items_viewed: ["uuid1", "uuid2"],
    time_spent_seconds: 45
  },
  created_at: new Date(),
  device_info: {
    device_type: "mobile",
    browser: "Chrome"
  }
}
*/

print("✅ customer_behavior collection created");

// =====================================================
// 9️⃣ PAYMENT LOGS (Optional - for audit)
// =====================================================

db.createCollection("payment_logs");

// Indexes
db.payment_logs.createIndex({ order_id: 1, created_at: -1 });
db.payment_logs.createIndex({ restaurant_id: 1, created_at: -1 });
db.payment_logs.createIndex({ status: 1, created_at: -1 });
db.payment_logs.createIndex({ transaction_ref: 1 });

// TTL index - auto delete after 2 years
db.payment_logs.createIndex(
  { created_at: 1 },
  { expireAfterSeconds: 63072000 }
);

// Example Document
/*
{
  order_id: "uuid",
  restaurant_id: "uuid",
  payment_id: "uuid",
  transaction_ref: "PAYOS_123456",
  amount: 250000,
  method: "PayOS",
  status: "Success",
  request_payload: {
    amount: 250000,
    description: "Payment for Order #123"
  },
  response_payload: {
    code: "00",
    message: "Success",
    transaction_id: "TXN_123456"
  },
  created_at: new Date(),
  processed_at: new Date()
}
*/

print("✅ payment_logs collection created");

// =====================================================
// 🔟 QR SCAN LOGS (Optional - for analytics)
// =====================================================

db.createCollection("qr_scan_logs");

// Indexes
db.qr_scan_logs.createIndex({ table_id: 1, scanned_at: -1 });
db.qr_scan_logs.createIndex({ restaurant_id: 1, scanned_at: -1 });
db.qr_scan_logs.createIndex({ branch_id: 1, scanned_at: -1 });

// TTL index - auto delete after 90 days
db.qr_scan_logs.createIndex(
  { scanned_at: 1 },
  { expireAfterSeconds: 7776000 }
);

// Example Document
/*
{
  table_id: "uuid",
  restaurant_id: "uuid",
  branch_id: "uuid",
  qr_code_token: "qr_table_001",
  session_id: "uuid",
  scanned_at: new Date(),
  device_info: {
    user_agent: "Mozilla/5.0...",
    device_type: "mobile",
    browser: "Chrome",
    os: "iOS"
  },
  location: {
    ip_address: "192.168.1.1",
    country: "Vietnam",
    city: "Hanoi"
  }
}
*/

print("✅ qr_scan_logs collection created");

// =====================================================
// SUMMARY
// =====================================================

print("\n========================================");
print("MongoDB Collections Summary:");
print("========================================");
print("✅ order_events - Order lifecycle tracking (TTL: 90 days)");
print("✅ service_requests - Customer service requests (TTL: 24 hours)");
print("✅ feedbacks - Customer ratings and reviews");
print("✅ activity_logs - System audit trail (TTL: 365 days)");
print("✅ table_sessions - Real-time table sessions (TTL: 7 days)");
print("✅ realtime_notifications - WebSocket events (TTL: 1 hour)");
print("✅ analytics_cache - Pre-calculated metrics (TTL: 90 days)");
print("✅ customer_behavior - Customer interaction tracking (TTL: 30 days)");
print("✅ payment_logs - Payment audit logs (TTL: 2 years)");
print("✅ qr_scan_logs - QR code scan tracking (TTL: 90 days)");
print("========================================");
print("🎉 MongoDB setup complete!");
print("========================================\n");

// Verify collections
print("Collections created:");
db.getCollectionNames().forEach(function(collection) {
    print("  - " + collection);
});
