# QR Service Platform - Production Architecture

## System Overview

**Target Scale:**
- 10,000+ restaurants across Southeast Asia
- 50 branches per restaurant
- 100 tables per branch
- 5,000 concurrent QR sessions per branch
- 99.9% uptime SLA

**Architecture Style:**
- Clean Architecture
- Modular Monolith (microservices-ready)
- Domain-Driven Design
- Event-Driven Architecture
- Multi-tenant SaaS

---

## Technology Stack

### Core Backend
- **Runtime:** Node.js 20 LTS + TypeScript 5.3
- **Framework:** Fastify (high performance)
- **Validation:** Zod (type-safe runtime validation)
- **Authentication:** JWT + Refresh Token Strategy

### Databases
- **PostgreSQL 16:** ACID transactions, relational data
- **MongoDB 7:** Event sourcing, logs, analytics
- **Redis 7:** Cache, session, pub/sub, rate limiting

### ORMs & Clients
- **Prisma:** PostgreSQL ORM with type safety
- **Mongoose:** MongoDB ODM with schemas
- **ioredis:** Redis client with cluster support

### Real-time & Messaging
- **Socket.io:** WebSocket for real-time updates
- **Bull:** Job queue with Redis backend

### Infrastructure
- **Docker:** Containerization
- **Docker Compose:** Local development
- **Nginx:** Reverse proxy & load balancer

### Monitoring & Logging
- **Winston:** Structured logging
- **Pino:** High-performance logging
- **Prometheus:** Metrics collection
- **Grafana:** Metrics visualization

### Payment Integration
- **PayOS:** Primary payment gateway
- **Webhook verification:** HMAC signature validation

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  (HTTP Routes, WebSocket Handlers, Middleware)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  (Use Cases, DTOs, Validation, Business Logic)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       Domain Layer                           │
│  (Entities, Value Objects, Domain Services, Events)         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                       │
│  (Repositories, External Services, Database Clients)        │
└─────────────────────────────────────────────────────────────┘
```

---

## Multi-Tenancy Strategy

### Tenant Isolation
- **Database Level:** All tables include `restaurant_id`
- **Application Level:** Middleware enforces tenant context
- **Query Level:** Automatic tenant filtering via Prisma middleware
- **Cache Level:** Tenant-scoped cache keys

### Tenant Context Flow
```typescript
Request → Auth Middleware → Extract restaurant_id → 
Set Tenant Context → All queries auto-filtered by restaurant_id
```

### Security Measures
- Row-level security ready (PostgreSQL RLS)
- Tenant ID validation on every request
- Cross-tenant access prevention
- Audit logging for all tenant operations

---

## Database Responsibility

### PostgreSQL (Source of Truth)
**Purpose:** ACID transactions, financial data, relational integrity

**Tables:**
- Tenant: `restaurants`, `subscriptions`, `subscription_feature_limits`
- Organization: `branches`, `users`, `roles`, `permissions`
- Facilities: `areas`, `tables`
- Menu: `categories`, `menu_items`, `customization_groups`, `customization_options`
- Orders: `orders`, `order_items`, `order_item_customizations`
- Payments: `payments`, `invoices`
- Reservations: `reservations`

**Characteristics:**
- Strong consistency
- ACID guarantees
- Foreign key constraints
- Complex joins
- Financial safety

### MongoDB (Event Store & Analytics)
**Purpose:** High-write throughput, flexible schema, event sourcing

**Collections:**
- `order_events` - Complete order lifecycle (TTL: 90 days)
- `service_requests` - Customer service requests (TTL: 24 hours)
- `feedbacks` - Customer reviews and ratings
- `activity_logs` - Audit trail (TTL: 365 days)
- `table_sessions` - Real-time session tracking (TTL: 7 days)
- `realtime_notifications` - WebSocket events (TTL: 1 hour)
- `analytics_cache` - Pre-calculated metrics (TTL: 90 days)
- `payment_logs` - Payment audit trail (TTL: 2 years)

**Characteristics:**
- Eventual consistency
- High write throughput
- Flexible schema
- TTL indexes for auto-cleanup
- Time-series data

### Redis (Cache & Real-time)
**Purpose:** Performance optimization, session management, pub/sub

**Use Cases:**
- Session storage (JWT blacklist, refresh tokens)
- Menu cache (frequently accessed)
- Table status cache
- Rate limiting
- Pub/Sub for WebSocket events
- Job queue (Bull)

**Cache Strategy:**
- Cache-aside pattern
- TTL-based expiration
- Tenant-scoped keys: `tenant:{restaurant_id}:menu:{branch_id}`
- Invalidation on write operations

---

## Data Flow Patterns

### 1. Customer Places Order (Write-Heavy)

```
Customer QR Scan
    ↓
[POST /api/orders]
    ↓
Validate DTO (Zod)
    ↓
Check Tenant Context
    ↓
BEGIN TRANSACTION (PostgreSQL)
    ├─ INSERT orders
    ├─ INSERT order_items
    ├─ UPDATE table status = 'Occupied'
    └─ COMMIT
    ↓
Write Event (MongoDB)
    └─ order_events.insert({ action: 'ORDER_CREATED' })
    ↓
Invalidate Cache (Redis)
    ├─ DEL tenant:{id}:table:{id}
    └─ DEL tenant:{id}:orders:active
    ↓
Emit WebSocket Event
    ├─ To Kitchen: 'new_order'
    ├─ To Staff: 'table_occupied'
    └─ To Customer: 'order_confirmed'
    ↓
Return Response
```

### 2. Payment Processing (Financial Safety)

```
[POST /api/payments/process]
    ↓
Validate Idempotency Key
    ↓
BEGIN TRANSACTION (PostgreSQL)
    ├─ SELECT * FROM orders WHERE id = ? FOR UPDATE
    ├─ Check order.payment_status != 'Success'
    ├─ INSERT payments
    ├─ UPDATE orders SET payment_status = 'Success'
    ├─ UPDATE tables SET status = 'Available'
    └─ COMMIT
    ↓
Write Event (MongoDB)
    ├─ order_events.insert({ action: 'PAYMENT_SUCCESS' })
    └─ payment_logs.insert({ transaction details })
    ↓
Invalidate Cache
    ↓
Emit WebSocket Event
    ↓
Send Notification (Queue Job)
```

### 3. Real-time Service Request

```
Customer Clicks "Call Staff"
    ↓
[POST /api/service-requests]
    ↓
Write to MongoDB (Fast)
    └─ service_requests.insert()
    ↓
Publish to Redis Pub/Sub
    └─ PUBLISH channel:branch:{id}:service
    ↓
WebSocket Server Receives
    ↓
Emit to Connected Staff
    └─ socket.to('staff-room').emit('service_request')
    ↓
Staff Acknowledges
    ↓
Update MongoDB
    └─ service_requests.update({ status: 'ACKNOWLEDGED' })
```

---

## Scalability Strategy

### Horizontal Scaling
- **Stateless API servers** - Scale behind load balancer
- **WebSocket sticky sessions** - Use Redis adapter
- **Database read replicas** - Route read queries to replicas
- **MongoDB sharding** - Shard by `restaurant_id`
- **Redis cluster** - Distributed cache

### Vertical Optimization
- **Connection pooling** - Prisma connection pool
- **Query optimization** - Proper indexes, avoid N+1
- **Caching strategy** - Multi-level cache (L1: Memory, L2: Redis)
- **Async processing** - Job queue for heavy tasks

### Performance Targets
- API response time: < 200ms (p95)
- WebSocket latency: < 50ms
- Database query time: < 50ms (p95)
- Cache hit rate: > 80%

---

## Security Architecture

### Authentication & Authorization
- **JWT Access Token:** 15 minutes expiry
- **Refresh Token:** 30 days expiry, stored in Redis
- **Role-Based Access Control (RBAC):** Owner, Manager, Staff
- **Permission-based actions:** Fine-grained permissions

### API Security
- **Rate Limiting:** 100 requests/15 minutes per IP
- **CORS:** Whitelist allowed origins
- **Helmet:** Security headers
- **Input Validation:** Zod schemas on all inputs
- **SQL Injection Prevention:** Prisma parameterized queries
- **XSS Prevention:** Sanitize user inputs

### Payment Security
- **Webhook Signature Verification:** HMAC-SHA256
- **Idempotency Keys:** Prevent duplicate payments
- **PCI Compliance:** Never store card details
- **Audit Logging:** All payment operations logged

### Data Protection
- **Encryption at Rest:** Database encryption
- **Encryption in Transit:** TLS 1.3
- **Sensitive Data:** Hash passwords with bcrypt (cost: 12)
- **PII Protection:** GDPR compliance ready

---

## Error Handling Strategy

### Error Types
```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
    public isOperational: boolean = true
  ) {}
}

// Business Logic Errors
class ValidationError extends AppError {}
class NotFoundError extends AppError {}
class UnauthorizedError extends AppError {}
class ForbiddenError extends AppError {}
class ConflictError extends AppError {}

// System Errors
class DatabaseError extends AppError {}
class ExternalServiceError extends AppError {}
```

### Global Error Handler
```typescript
app.setErrorHandler((error, request, reply) => {
  // Log error
  logger.error({
    err: error,
    req: request,
    tenant: request.tenantContext?.restaurantId
  });

  // Operational errors (expected)
  if (error.isOperational) {
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    });
  }

  // Programming errors (unexpected)
  return reply.status(500).send({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});
```

---

## Monitoring & Observability

### Logging Strategy
```typescript
// Structured logging with Winston
logger.info('Order created', {
  orderId: order.id,
  restaurantId: order.restaurantId,
  branchId: order.branchId,
  tableId: order.tableId,
  totalAmount: order.totalAmount,
  duration: Date.now() - startTime
});
```

### Metrics Collection
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (errors/second)
- Database query time
- Cache hit/miss rate
- WebSocket connections
- Queue job processing time

### Health Checks
```
GET /health
  ├─ PostgreSQL: SELECT 1
  ├─ MongoDB: db.admin().ping()
  ├─ Redis: PING
  └─ Return: { status: 'healthy', services: {...} }
```

### Alerting
- API error rate > 5%
- Database connection pool exhausted
- Redis memory > 80%
- WebSocket disconnection rate > 10%
- Payment failure rate > 2%

---

## Deployment Strategy

### Environments
- **Development:** Local Docker Compose
- **Staging:** Kubernetes cluster (mirrors production)
- **Production:** Kubernetes cluster with auto-scaling

### CI/CD Pipeline
```
Git Push → GitHub Actions
  ├─ Run Tests (Unit + Integration)
  ├─ Run Linting (ESLint + Prettier)
  ├─ Build Docker Image
  ├─ Push to Container Registry
  ├─ Deploy to Staging
  ├─ Run E2E Tests
  └─ Deploy to Production (manual approval)
```

### Database Migration Strategy
- **Prisma Migrate:** Version-controlled migrations
- **Zero-downtime migrations:** Backward-compatible changes
- **Rollback plan:** Always have rollback scripts ready

---

## Cost Optimization

### Database
- Use read replicas for analytics queries
- Archive old data to cold storage
- MongoDB TTL indexes for auto-cleanup

### Compute
- Auto-scaling based on CPU/Memory
- Spot instances for non-critical workloads
- CDN for static assets

### Monitoring
- Log sampling for high-volume endpoints
- Metrics aggregation to reduce storage

---

## Future Microservices Migration Path

**Phase 1: Modular Monolith** (Current)
- Clear module boundaries
- Separate database schemas per domain

**Phase 2: Extract High-Load Services**
- Order Service (high write)
- Payment Service (critical)
- Notification Service (async)

**Phase 3: Full Microservices**
- API Gateway (Kong/Nginx)
- Service mesh (Istio)
- Event bus (Kafka/RabbitMQ)

---

**Architecture Version:** 1.0  
**Last Updated:** 2024  
**Status:** Production-Ready
