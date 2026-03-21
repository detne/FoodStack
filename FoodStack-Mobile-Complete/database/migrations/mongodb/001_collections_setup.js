// =====================================================
// QR Service Platform - MongoDB Collections Setup
// Migration: 001_collections_setup
// Description: Create collections with indexes and validation
// =====================================================

// Connect to database
use qr_service_platform;

// 1️⃣ ORDER EVENTS COLLECTION
// Purpose: Track all order lifecycle events and changes
db.createCollection("order_events", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["order_id", "action", "timestamp"],
      properties: {
        order_id: {
          bsonType: "string",
          description: "UUID of the order"
        },
        table_id: {
          bsonType: "string",
          description: "UUID of the table"
        },
        restaurant_id: {
          bsonType: "string",
          description: "UUID of the restaurant"
        },
        branch_id: {
          bsonType: "string",
          description: "UUID of the branch"
        },
        action: {
          enum: [
            "ORDER_CREATED",
            "ITEM_ADDED",
            "ITEM_REMOVED",
            "ITEM_UPDATED",
            "STATUS_CHANGED",
            "PAYMENT_INITIATED",
            "PAYMENT_COMPLETED",
            "ORDER_CANCELLED"
          ],
          description: "Type of event"
        },
        performed_by: {
          bsonType: "string",
          description: "User ID or session token"
        },
        timestamp: {
          bsonType: "date",
          description: "When the event occurred"
        },
        details: {
          bsonType: "object",
          description: "Additional event data"
        },
        metadata: {
          bsonType: "object",
          description: "Extra metadata (IP, device, etc.)"
        }
      }
    }
  }
});

// Indexes for order_events
db.order_events.createIndex({ order_id: 1, timestamp: -1 });
db.order_events.createIndex({ table_id: 1, timestamp: -1 });
db.order_events.createIndex({ restaurant_id: 1, timestamp: -1 });
db.order_events.createIndex({ action: 1, timestamp: -1 });
db.order_events.createIndex({ timestamp: -1 }); // For cleanup queries
db.order_events.createIndex({ "details.item_id": 1 }); // For item-specific queries

// TTL index - auto delete after 90 days
db.order_events.createIndex(
  { timestamp: 1 },
  { expireAfterSeconds: 7776000 } // 90 days
);

print("✅ order_events collection created");

// 2️⃣ SERVICE REQUESTS COLLECTION
// Purpose: Track customer service requests at tables (call staff, water, etc.)
db.createCollection("service_requests", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["restaurant_id", "branch_id", "table_id", "request_type", "status", "created_at"],
      properties: {
        restaurant_id: {
          bsonType: "string",
          description: "UUID of the restaurant"
        },
        branch_id: {
          bsonType: "string",
          description: "UUID of the branch"
        },
        table_id: {
          bsonType: "string",
          description: "UUID of the table"
        },
        session_id: {
          bsonType: "string",
          description: "Order session ID"
        },
        request_type: {
          enum: [
            "CALL_STAFF",
            "REQUEST_WATER",
            "REQUEST_NAPKIN",
            "REQUEST_UTENSILS",
            "REQUEST_BILL",
            "REQUEST_MENU",
            "COMPLAINT",
            "OTHER"
          ],
          description: "Type of service request"
        },
        status: {
          enum: ["PENDING", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "CANCELLED"],
          description: "Current status"
        },
        priority: {
          enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
          description: "Request priority"
        },
        message: {
          bsonType: "string",
          description: "Optional message from customer"
        },
        assigned_to: {
          bsonType: "string",
          description: "Staff user ID who handles this"
        },
        created_at: {
          bsonType: "date",
          description: "When request was created"
        },
        acknowledged_at: {
          bsonType: "date",
          description: "When staff saw the request"
        },
        resolved_at: {
          bsonType: "date",
          description: "When request was completed"
        },
        response_time_seconds: {
          bsonType: "int",
          description: "Time taken to resolve (for analytics)"
        }
      }
    }
  }
});

// Indexes for service_requests
db.service_requests.createIndex({ restaurant_id: 1, status: 1, created_at: -1 });
db.service_requests.createIndex({ branch_id: 1, status: 1, created_at: -1 });
db.service_requests.createIndex({ table_id: 1, status: 1 });
db.service_requests.createIndex({ assigned_to: 1, status: 1 });
db.service_requests.createIndex({ status: 1, priority: -1, created_at: 1 });

// TTL index - auto delete after 24 hours
db.service_requests.createIndex(
  { created_at: 1 },
  { expireAfterSeconds: 86400 } // 24 hours
);

print("✅ service_requests collection created");

// 3️⃣ FEEDBACKS COLLECTION
// Purpose: Customer feedback and ratings
db.createCollection("feedbacks", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["restaurant_id", "created_at"],
      properties: {
        order_id: {
          bsonType: "string",
          description: "UUID of the order"
        },
        restaurant_id: {
          bsonType: "string",
          description: "UUID of the restaurant"
        },
        branch_id: {
          bsonType: "string",
          description: "UUID of the branch"
        },
        table_id: {
          bsonType: "string",
          description: "UUID of the table"
        },
        session_id: {
          bsonType: "string",
          description: "Order session ID"
        },
        overall_rating: {
          bsonType: "int",
          minimum: 1,
          maximum: 5,
          description: "Overall rating 1-5 stars"
        },
        food_rating: {
          bsonType: "int",
          minimum: 1,
          maximum: 5
        },
        service_rating: {
          bsonType: "int",
          minimum: 1,
          maximum: 5
        },
        ambiance_rating: {
          bsonType: "int",
          minimum: 1,
          maximum: 5
        },
        comment: {
          bsonType: "string",
          description: "Customer comment"
        },
        dish_ratings: {
          bsonType: "array",
          description: "Individual dish ratings",
          items: {
            bsonType: "object",
            required: ["item_id", "rating"],
            properties: {
              item_id: {
                bsonType: "string",
                description: "Menu item UUID"
              },
              item_name: {
                bsonType: "string"
              },
              rating: {
                bsonType: "int",
                minimum: 1,
                maximum: 5
              },
              note: {
                bsonType: "string"
              }
            }
          }
        },
        images: {
          bsonType: "array",
          description: "Photo URLs uploaded by customer",
          items: {
            bsonType: "string"
          }
        },
        tags: {
          bsonType: "array",
          description: "Tags like 'delicious', 'slow service', etc.",
          items: {
            bsonType: "string"
          }
        },
        is_anonymous: {
          bsonType: "bool",
          description: "Whether feedback is anonymous"
        },
        customer_name: {
          bsonType: "string"
        },
        customer_email: {
          bsonType: "string"
        },
        response: {
          bsonType: "object",
          description: "Restaurant response to feedback",
          properties: {
            message: { bsonType: "string" },
            responded_by: { bsonType: "string" },
            responded_at: { bsonType: "date" }
          }
        },
        created_at: {
          bsonType: "date"
        },
        sentiment: {
          enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"],
          description: "Auto-detected sentiment"
        }
      }
    }
  }
});

// Indexes for feedbacks
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

print("✅ feedbacks collection created");

// 4️⃣ ACTIVITY LOGS COLLECTION
// Purpose: Audit trail for all system actions
db.createCollection("activity_logs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["restaurant_id", "action", "timestamp"],
      properties: {
        user_id: {
          bsonType: "string",
          description: "UUID of user who performed action"
        },
        restaurant_id: {
          bsonType: "string",
          description: "UUID of restaurant"
        },
        branch_id: {
          bsonType: "string",
          description: "UUID of branch (if applicable)"
        },
        action: {
          bsonType: "string",
          description: "Action performed (e.g., UPDATE_MENU_PRICE)"
        },
        entity: {
          bsonType: "string",
          description: "Entity type (e.g., menu_items, users)"
        },
        entity_id: {
          bsonType: "string",
          description: "UUID of affected entity"
        },
        old_value: {
          bsonType: "object",
          description: "Previous state"
        },
        new_value: {
          bsonType: "object",
          description: "New state"
        },
        ip_address: {
          bsonType: "string"
        },
        user_agent: {
          bsonType: "string"
        },
        timestamp: {
          bsonType: "date"
        },
        severity: {
          enum: ["INFO", "WARNING", "ERROR", "CRITICAL"],
          description: "Log severity level"
        }
      }
    }
  }
});

// Indexes for activity_logs
db.activity_logs.createIndex({ restaurant_id: 1, timestamp: -1 });
db.activity_logs.createIndex({ user_id: 1, timestamp: -1 });
db.activity_logs.createIndex({ entity: 1, entity_id: 1, timestamp: -1 });
db.activity_logs.createIndex({ action: 1, timestamp: -1 });
db.activity_logs.createIndex({ severity: 1, timestamp: -1 });

// TTL index - auto delete after 1 year
db.activity_logs.createIndex(
  { timestamp: 1 },
  { expireAfterSeconds: 31536000 } // 365 days
);

print("✅ activity_logs collection created");

// 5️⃣ TABLE SESSIONS COLLECTION
// Purpose: Track real-time customer sessions at tables
db.createCollection("table_sessions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["table_id", "session_token", "started_at"],
      properties: {
        table_id: {
          bsonType: "string",
          description: "UUID of table"
        },
        restaurant_id: {
          bsonType: "string"
        },
        branch_id: {
          bsonType: "string"
        },
        session_token: {
          bsonType: "string",
          description: "Unique session identifier"
        },
        customer_count: {
          bsonType: "int",
          minimum: 1,
          description: "Number of customers at table"
        },
        started_at: {
          bsonType: "date"
        },
        ended_at: {
          bsonType: "date"
        },
        duration_minutes: {
          bsonType: "int",
          description: "Session duration (calculated)"
        },
        events: {
          bsonType: "array",
          description: "Timeline of customer interactions",
          items: {
            bsonType: "object",
            properties: {
              type: {
                enum: ["SCAN_QR", "VIEW_MENU", "ADD_ITEM", "CALL_STAFF", "REQUEST_BILL", "PAYMENT"]
              },
              timestamp: { bsonType: "date" },
              details: { bsonType: "object" }
            }
          }
        },
        device_info: {
          bsonType: "object",
          properties: {
            user_agent: { bsonType: "string" },
            device_type: { bsonType: "string" },
            browser: { bsonType: "string" }
          }
        }
      }
    }
  }
});

// Indexes for table_sessions
db.table_sessions.createIndex({ table_id: 1, started_at: -1 });
db.table_sessions.createIndex({ session_token: 1 }, { unique: true });
db.table_sessions.createIndex({ restaurant_id: 1, started_at: -1 });
db.table_sessions.createIndex({ branch_id: 1, started_at: -1 });

// TTL index - auto delete after 7 days
db.table_sessions.createIndex(
  { ended_at: 1 },
  { expireAfterSeconds: 604800 } // 7 days
);

print("✅ table_sessions collection created");

// 6️⃣ REALTIME NOTIFICATIONS COLLECTION
// Purpose: WebSocket events and real-time notifications
db.createCollection("realtime_notifications", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["restaurant_id", "type", "created_at"],
      properties: {
        restaurant_id: {
          bsonType: "string"
        },
        branch_id: {
          bsonType: "string"
        },
        type: {
          enum: [
            "NEW_ORDER",
            "ORDER_STATUS_CHANGE",
            "SERVICE_REQUEST",
            "NEW_RESERVATION",
            "PAYMENT_RECEIVED",
            "TABLE_STATUS_CHANGE"
          ]
        },
        payload: {
          bsonType: "object",
          description: "Event data"
        },
        target_users: {
          bsonType: "array",
          description: "User IDs who should receive this",
          items: { bsonType: "string" }
        },
        target_roles: {
          bsonType: "array",
          description: "Roles who should receive this",
          items: { bsonType: "string" }
        },
        created_at: {
          bsonType: "date"
        },
        delivered_at: {
          bsonType: "date"
        },
        is_delivered: {
          bsonType: "bool",
          description: "Whether notification was sent"
        }
      }
    }
  }
});

// Indexes for realtime_notifications
db.realtime_notifications.createIndex({ restaurant_id: 1, created_at: -1 });
db.realtime_notifications.createIndex({ branch_id: 1, created_at: -1 });
db.realtime_notifications.createIndex({ type: 1, created_at: -1 });
db.realtime_notifications.createIndex({ is_delivered: 1, created_at: 1 });

// TTL index - auto delete after 1 hour
db.realtime_notifications.createIndex(
  { created_at: 1 },
  { expireAfterSeconds: 3600 } // 1 hour
);

print("✅ realtime_notifications collection created");

// 7️⃣ ANALYTICS CACHE COLLECTION
// Purpose: Pre-calculated analytics for dashboard performance
db.createCollection("analytics_cache", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["restaurant_id", "metric_type", "period", "calculated_at"],
      properties: {
        restaurant_id: { bsonType: "string" },
        branch_id: { bsonType: "string" },
        metric_type: {
          enum: [
            "DAILY_REVENUE",
            "POPULAR_ITEMS",
            "PEAK_HOURS",
            "AVG_ORDER_VALUE",
            "TABLE_TURNOVER",
            "SERVICE_RESPONSE_TIME"
          ]
        },
        period: {
          bsonType: "string",
          description: "e.g., '2024-01-15' or '2024-01'"
        },
        data: {
          bsonType: "object",
          description: "Calculated metrics"
        },
        calculated_at: {
          bsonType: "date"
        }
      }
    }
  }
});

// Indexes for analytics_cache
db.analytics_cache.createIndex(
  { restaurant_id: 1, metric_type: 1, period: 1 },
  { unique: true }
);
db.analytics_cache.createIndex({ calculated_at: 1 });

// TTL index - auto delete after 90 days
db.analytics_cache.createIndex(
  { calculated_at: 1 },
  { expireAfterSeconds: 7776000 } // 90 days
);

print("✅ analytics_cache collection created");

// =====================================================
// SUMMARY
// =====================================================
print("\n📊 MongoDB Collections Summary:");
print("✅ order_events - Order lifecycle tracking (TTL: 90 days)");
print("✅ service_requests - Customer service requests (TTL: 24 hours)");
print("✅ feedbacks - Customer ratings and reviews");
print("✅ activity_logs - System audit trail (TTL: 365 days)");
print("✅ table_sessions - Real-time table sessions (TTL: 7 days)");
print("✅ realtime_notifications - WebSocket events (TTL: 1 hour)");
print("✅ analytics_cache - Pre-calculated metrics (TTL: 90 days)");
print("\n🎉 MongoDB setup complete!");
