# Database Schema Diagram

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    QR Service Platform                       │
│                   Polyglot Persistence                       │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────▼────────┐      ┌──────▼──────┐
        │   PostgreSQL   │      │   MongoDB   │
        │  (ACID Data)   │      │ (Logs/Events)│
        └────────────────┘      └─────────────┘
```

## 📊 PostgreSQL Schema

### Core Entities Relationship

```
restaurants (Tenant Root)
    │
    ├─── subscriptions
    │       └─── subscription_feature_limits
    │
    ├─── branches
    │       │
    │       ├─── areas
    │       │       └─── tables
    │       │               │
    │       │               ├─── order_sessions
    │       │               ├─── orders
    │       │               └─── reservations
    │       │
    │       └─── menu_items
    │               └─── categories
    │
    └─── users
```

### Detailed Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                         TENANT LAYER                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────────┐
│ restaurants  │────────▶│  subscriptions   │
│              │         │                  │
│ - id         │         │ - restaurant_id  │
│ - name       │         │ - plan_type      │
│ - email      │         │ - start_date     │
│ - status     │         │ - end_date       │
└──────────────┘         │ - status         │
                         └──────────────────┘
                                  │
                                  │
                         ┌────────▼──────────────────┐
                         │ subscription_feature_     │
                         │ limits                    │
                         │                           │
                         │ - plan_type (PK)          │
                         │ - max_tables              │
                         │ - has_split_bill          │
                         │ - has_feedback            │
                         └───────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      ORGANIZATION LAYER                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐
│ restaurants  │────────▶│   branches   │
└──────────────┘         │              │
                         │ - id         │
                         │ - name       │
                         │ - address    │
                         │ - open_time  │
                         └──────────────┘
                                │
                    ┌───────────┼───────────┐
                    │                       │
            ┌───────▼──────┐        ┌──────▼──────┐
            │    areas     │        │    users    │
            │              │        │             │
            │ - branch_id  │        │ - branch_id │
            │ - name       │        │ - role      │
            └──────────────┘        │ - status    │
                    │               └─────────────┘
                    │
            ┌───────▼──────┐
            │    tables    │
            │              │
            │ - area_id    │
            │ - name       │
            │ - capacity   │
            │ - status     │
            │ - qr_code    │
            └──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         MENU LAYER                               │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────────┐
│ categories   │────────▶│   menu_items     │
│              │         │                  │
│ - name       │         │ - category_id    │
│ - sort_order │         │ - name           │
└──────────────┘         │ - price          │
                         │ - description    │
                         │ - image_url      │
                         └──────────────────┘
                                  │
                                  │
                         ┌────────▼──────────────────┐
                         │ item_customizations       │
                         │                           │
                         │ - menu_item_id            │
                         │ - group_id                │
                         └───────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
        ┌───────────▼──────────┐    ┌──────────▼──────────┐
        │ customization_groups │    │ customization_      │
        │                      │    │ options             │
        │ - name               │    │                     │
        │ - min_select         │    │ - group_id          │
        │ - max_select         │    │ - name              │
        └──────────────────────┘    │ - price_delta       │
                                    └─────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         ORDER LAYER                              │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────────┐
│   tables     │────────▶│ order_sessions   │
└──────────────┘         │                  │
                         │ - table_id       │
                         │ - session_token  │
                         │ - started_at     │
                         │ - ended_at       │
                         └──────────────────┘
                                  │
                                  │
                         ┌────────▼──────────────────┐
                         │      orders               │
                         │                           │
                         │ - session_id              │
                         │ - table_id                │
                         │ - status                  │
                         │ - sub_total               │
                         │ - total_amount            │
                         │ - payment_status          │
                         └───────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
        ┌───────────▼──────────┐    ┌──────────▼──────────┐
        │   order_items        │    │    payments         │
        │                      │    │                     │
        │ - order_id           │    │ - order_id          │
        │ - menu_item_id       │    │ - amount            │
        │ - quantity           │    │ - method            │
        │ - base_price         │    │ - status            │
        └──────────────────────┘    │ - transaction_ref   │
                    │               └─────────────────────┘
                    │
        ┌───────────▼──────────────────────┐
        │ order_item_customizations        │
        │                                  │
        │ - order_item_id                  │
        │ - option_id                      │
        │ - price_delta                    │
        └──────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      RESERVATION LAYER                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────────┐
│   branches   │────────▶│  reservations    │
└──────────────┘         │                  │
                         │ - branch_id      │
┌──────────────┐         │ - table_id       │
│   tables     │────────▶│ - customer_name  │
└──────────────┘         │ - party_size     │
                         │ - status         │
                         └──────────────────┘
```

## 🍃 MongoDB Collections

```
┌─────────────────────────────────────────────────────────────────┐
│                      EVENT SOURCING                              │
└─────────────────────────────────────────────────────────────────┘

order_events {
    order_id: UUID
    action: "ITEM_ADDED" | "STATUS_CHANGED" | ...
    performed_by: string
    timestamp: Date
    details: {
        item_id: UUID
        quantity: number
        ...
    }
}
TTL: 90 days

┌─────────────────────────────────────────────────────────────────┐
│                    REAL-TIME SERVICES                            │
└─────────────────────────────────────────────────────────────────┘

service_requests {
    restaurant_id: UUID
    table_id: UUID
    request_type: "CALL_STAFF" | "REQUEST_WATER" | ...
    status: "PENDING" | "RESOLVED"
    created_at: Date
    resolved_at: Date
}
TTL: 24 hours

table_sessions {
    table_id: UUID
    session_token: string
    customer_count: number
    events: [
        { type: "SCAN_QR", timestamp: Date },
        { type: "VIEW_MENU", timestamp: Date }
    ]
    started_at: Date
    ended_at: Date
}
TTL: 7 days

realtime_notifications {
    restaurant_id: UUID
    type: "NEW_ORDER" | "SERVICE_REQUEST" | ...
    payload: { ... }
    target_users: [UUID]
    created_at: Date
}
TTL: 1 hour

┌─────────────────────────────────────────────────────────────────┐
│                    FEEDBACK & ANALYTICS                          │
└─────────────────────────────────────────────────────────────────┘

feedbacks {
    order_id: UUID
    restaurant_id: UUID
    overall_rating: 1-5
    food_rating: 1-5
    service_rating: 1-5
    comment: string
    dish_ratings: [
        { item_id: UUID, rating: 1-5, note: string }
    ]
    images: [string]
    created_at: Date
}

activity_logs {
    user_id: UUID
    restaurant_id: UUID
    action: "UPDATE_MENU_PRICE" | ...
    entity: "menu_items"
    entity_id: UUID
    old_value: { ... }
    new_value: { ... }
    timestamp: Date
}
TTL: 365 days

analytics_cache {
    restaurant_id: UUID
    metric_type: "DAILY_REVENUE" | "POPULAR_ITEMS" | ...
    period: "2024-01-15"
    data: { ... }
    calculated_at: Date
}
TTL: 90 days
```

## 🔄 Data Flow Examples

### 1. Customer Orders via QR

```
1. Customer scans QR
   ├─ PostgreSQL: Check table status
   └─ MongoDB: Log scan event in table_sessions

2. Customer views menu
   ├─ PostgreSQL: Fetch menu_items + customizations
   └─ MongoDB: Log view event

3. Customer adds items to cart
   └─ MongoDB: Log item_added events

4. Customer submits order
   ├─ PostgreSQL: INSERT into orders + order_items (TRANSACTION)
   ├─ MongoDB: Log order_created event
   └─ MongoDB: Create realtime_notification for kitchen

5. Kitchen updates status
   ├─ PostgreSQL: UPDATE orders SET status = 'Preparing'
   ├─ MongoDB: Log status_changed event
   └─ MongoDB: Push notification to customer

6. Customer pays
   ├─ PostgreSQL: INSERT into payments (TRANSACTION)
   ├─ PostgreSQL: UPDATE orders SET payment_status = 'Success'
   ├─ PostgreSQL: UPDATE tables SET status = 'Available'
   └─ MongoDB: Log payment_completed event
```

### 2. Service Request Flow

```
1. Customer clicks "Call Staff"
   └─ MongoDB: INSERT into service_requests

2. Staff receives notification
   └─ MongoDB: realtime_notifications

3. Staff acknowledges
   └─ MongoDB: UPDATE service_requests SET status = 'ACKNOWLEDGED'

4. Staff resolves
   └─ MongoDB: UPDATE service_requests SET status = 'RESOLVED'
   └─ Calculate response_time_seconds
```

### 3. Analytics Dashboard

```
1. Dashboard loads
   └─ MongoDB: Check analytics_cache

2. If cache miss
   ├─ PostgreSQL: Query orders for revenue
   ├─ PostgreSQL: Query order_items for popular items
   ├─ MongoDB: Query service_requests for response times
   └─ MongoDB: Store results in analytics_cache

3. Return cached data
```

## 📈 Scaling Considerations

### PostgreSQL
- **Read Replicas**: For heavy read operations (menu, dashboard)
- **Partitioning**: Orders table by date (monthly partitions)
- **Connection Pooling**: PgBouncer for connection management

### MongoDB
- **Sharding**: By restaurant_id for horizontal scaling
- **Replica Sets**: For high availability
- **TTL Indexes**: Auto-cleanup old data

### Redis (Future)
- **Session Cache**: User sessions
- **Menu Cache**: Frequently accessed menus
- **Rate Limiting**: API throttling
- **Pub/Sub**: Real-time notifications

## 🔐 Security

### PostgreSQL
- Row-Level Security (RLS) for multi-tenancy
- Encrypted connections (SSL)
- Prepared statements (SQL injection prevention)

### MongoDB
- Field-level encryption for sensitive data
- Role-based access control
- Audit logging enabled

## 📊 Indexes Summary

### PostgreSQL Critical Indexes
```sql
-- Most important for performance
idx_orders_branch_status_date
idx_menu_items_branch_category
idx_tables_branch_status
idx_users_active
idx_orders_table_active
```

### MongoDB Critical Indexes
```javascript
// Most important for performance
order_events: { order_id: 1, timestamp: -1 }
service_requests: { branch_id: 1, status: 1, created_at: -1 }
feedbacks: { restaurant_id: 1, created_at: -1 }
table_sessions: { table_id: 1, started_at: -1 }
```

---

**Last Updated**: 2024  
**Version**: 1.0.0
