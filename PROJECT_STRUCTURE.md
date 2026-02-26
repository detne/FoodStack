# QR Service Platform - Project Structure

## Clean Architecture Folder Structure

```
qr-service-platform/
├── src/
│   ├── config/                          # Configuration files
│   │   ├── database.config.ts           # Database connections
│   │   ├── logger.config.ts             # Winston logger setup
│   │   ├── redis.config.ts              # Redis configuration
│   │   ├── env.config.ts                # Environment variables
│   │   └── constants.ts                 # Application constants
│   │
│   ├── core/                            # Core/Shared layer
│   │   ├── types/                       # Shared TypeScript types
│   │   │   ├── index.ts
│   │   │   ├── common.types.ts
│   │   │   └── tenant.types.ts
│   │   │
│   │   ├── errors/                      # Custom error classes
│   │   │   ├── AppError.ts
│   │   │   ├── ValidationError.ts
│   │   │   ├── NotFoundError.ts
│   │   │   ├── UnauthorizedError.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/                       # Utility functions
│   │   │   ├── encryption.util.ts
│   │   │   ├── date.util.ts
│   │   │   ├── validation.util.ts
│   │   │   └── index.ts
│   │   │
│   │   └── interfaces/                  # Core interfaces
│   │       ├── IRepository.ts
│   │       ├── IUseCase.ts
│   │       └── index.ts
│   │
│   ├── infrastructure/                  # Infrastructure layer
│   │   ├── database/
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma
│   │   │   │   └── migrations/
│   │   │   │
│   │   │   ├── mongodb/
│   │   │   │   ├── models/
│   │   │   │   │   ├── OrderEvent.model.ts
│   │   │   │   │   ├── ServiceRequest.model.ts
│   │   │   │   │   ├── Feedback.model.ts
│   │   │   │   │   └── ActivityLog.model.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── redis/
│   │   │       ├── RedisClient.ts
│   │   │       └── CacheService.ts
│   │   │
│   │   ├── repositories/                # Data access layer
│   │   │   ├── postgres/
│   │   │   │   ├── RestaurantRepository.ts
│   │   │   │   ├── BranchRepository.ts
│   │   │   │   ├── TableRepository.ts
│   │   │   │   ├── MenuRepository.ts
│   │   │   │   ├── OrderRepository.ts
│   │   │   │   ├── PaymentRepository.ts
│   │   │   │   └── UserRepository.ts
│   │   │   │
│   │   │   └── mongodb/
│   │   │       ├── OrderEventRepository.ts
│   │   │       ├── ServiceRequestRepository.ts
│   │   │       └── FeedbackRepository.ts
│   │   │
│   │   ├── external/                    # External service integrations
│   │   │   ├── payos/
│   │   │   │   ├── PayOSClient.ts
│   │   │   │   ├── PayOSWebhook.ts
│   │   │   │   └── types.ts
│   │   │   │
│   │   │   ├── cloudinary/
│   │   │   │   └── CloudinaryService.ts
│   │   │   │
│   │   │   └── email/
│   │   │       └── EmailService.ts
│   │   │
│   │   └── queue/                       # Job queue
│   │       ├── QueueManager.ts
│   │       └── jobs/
│   │           ├── SendEmailJob.ts
│   │           ├── GenerateReportJob.ts
│   │           └── index.ts
│   │
│   ├── domain/                          # Domain layer (Business logic)
│   │   ├── entities/                    # Domain entities
│   │   │   ├── Restaurant.entity.ts
│   │   │   ├── Order.entity.ts
│   │   │   ├── Payment.entity.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── value-objects/               # Value objects
│   │   │   ├── Money.vo.ts
│   │   │   ├── Email.vo.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── events/                      # Domain events
│   │   │   ├── OrderCreatedEvent.ts
│   │   │   ├── PaymentProcessedEvent.ts
│   │   │   └── index.ts
│   │   │
│   │   └── services/                    # Domain services
│   │       ├── OrderDomainService.ts
│   │       ├── PaymentDomainService.ts
│   │       └── index.ts
│   │
│   ├── application/                     # Application layer (Use cases)
│   │   ├── dtos/                        # Data Transfer Objects
│   │   │   ├── order/
│   │   │   │   ├── CreateOrderDto.ts
│   │   │   │   ├── UpdateOrderDto.ts
│   │   │   │   └── OrderResponseDto.ts
│   │   │   │
│   │   │   ├── payment/
│   │   │   │   ├── ProcessPaymentDto.ts
│   │   │   │   └── PaymentResponseDto.ts
│   │   │   │
│   │   │   └── common/
│   │   │       ├── PaginationDto.ts
│   │   │       └── ResponseDto.ts
│   │   │
│   │   ├── use-cases/                   # Business use cases
│   │   │   ├── order/
│   │   │   │   ├── CreateOrderUseCase.ts
│   │   │   │   ├── GetOrderUseCase.ts
│   │   │   │   ├── UpdateOrderStatusUseCase.ts
│   │   │   │   └── CancelOrderUseCase.ts
│   │   │   │
│   │   │   ├── payment/
│   │   │   │   ├── ProcessPaymentUseCase.ts
│   │   │   │   ├── RefundPaymentUseCase.ts
│   │   │   │   └── VerifyPaymentWebhookUseCase.ts
│   │   │   │
│   │   │   ├── menu/
│   │   │   │   ├── GetMenuUseCase.ts
│   │   │   │   ├── CreateMenuItemUseCase.ts
│   │   │   │   └── UpdateMenuItemUseCase.ts
│   │   │   │
│   │   │   ├── table/
│   │   │   │   ├── GetTableByQRUseCase.ts
│   │   │   │   └── UpdateTableStatusUseCase.ts
│   │   │   │
│   │   │   └── auth/
│   │   │       ├── LoginUseCase.ts
│   │   │       ├── RegisterUseCase.ts
│   │   │       └── RefreshTokenUseCase.ts
│   │   │
│   │   ├── services/                    # Application services
│   │   │   ├── OrderService.ts
│   │   │   ├── PaymentService.ts
│   │   │   ├── MenuService.ts
│   │   │   ├── AuthService.ts
│   │   │   └── CacheService.ts
│   │   │
│   │   └── validators/                  # Input validation (Zod)
│   │       ├── order.validator.ts
│   │       ├── payment.validator.ts
│   │       ├── menu.validator.ts
│   │       └── auth.validator.ts
│   │
│   ├── presentation/                    # Presentation layer (API)
│   │   ├── http/
│   │   │   ├── routes/                  # API routes
│   │   │   │   ├── v1/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── order.routes.ts
│   │   │   │   │   ├── payment.routes.ts
│   │   │   │   │   ├── menu.routes.ts
│   │   │   │   │   ├── table.routes.ts
│   │   │   │   │   ├── auth.routes.ts
│   │   │   │   │   ├── restaurant.routes.ts
│   │   │   │   │   └── webhook.routes.ts
│   │   │   │   │
│   │   │   │   └── public/
│   │   │   │       ├── qr.routes.ts
│   │   │   │       └── menu.routes.ts
│   │   │   │
│   │   │   ├── controllers/             # HTTP controllers
│   │   │   │   ├── OrderController.ts
│   │   │   │   ├── PaymentController.ts
│   │   │   │   ├── MenuController.ts
│   │   │   │   ├── TableController.ts
│   │   │   │   └── AuthController.ts
│   │   │   │
│   │   │   └── middleware/              # HTTP middleware
│   │   │       ├── auth.middleware.ts
│   │   │       ├── tenant.middleware.ts
│   │   │       ├── validation.middleware.ts
│   │   │       ├── rateLimit.middleware.ts
│   │   │       ├── errorHandler.middleware.ts
│   │   │       └── logger.middleware.ts
│   │   │
│   │   └── websocket/                   # WebSocket layer
│   │       ├── SocketServer.ts
│   │       ├── handlers/
│   │       │   ├── OrderHandler.ts
│   │       │   ├── ServiceRequestHandler.ts
│   │       │   └── NotificationHandler.ts
│   │       │
│   │       └── middleware/
│   │           └── auth.middleware.ts
│   │
│   ├── shared/                          # Shared utilities
│   │   ├── decorators/
│   │   │   ├── Transactional.ts
│   │   │   └── Cache.ts
│   │   │
│   │   ├── guards/
│   │   │   ├── AuthGuard.ts
│   │   │   └── RoleGuard.ts
│   │   │
│   │   └── interceptors/
│   │       └── ResponseInterceptor.ts
│   │
│   ├── app.ts                           # Application setup
│   └── server.ts                        # Server entry point
│
├── tests/                               # Test files
│   ├── unit/
│   │   ├── use-cases/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── integration/
│   │   ├── repositories/
│   │   └── api/
│   │
│   └── e2e/
│       └── order-flow.test.ts
│
├── prisma/                              # Prisma schema
│   ├── schema.prisma
│   └── migrations/
│
├── database/                            # Database scripts
│   ├── schema_complete.sql
│   ├── mongodb_complete.js
│   └── scripts/
│
├── docker/                              # Docker files
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── docker-compose.yml
│
├── scripts/                             # Utility scripts
│   ├── seed.ts
│   ├── migrate.ts
│   └── generate-keys.ts
│
├── docs/                                # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
│
├── .env.example                         # Environment template
├── .env.development
├── .env.production
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── package.json
└── README.md
```

## Layer Responsibilities

### 1. Presentation Layer (`src/presentation/`)
- HTTP request handling
- WebSocket connections
- Input validation
- Response formatting
- Authentication/Authorization
- Rate limiting

### 2. Application Layer (`src/application/`)
- Use case orchestration
- Business workflow coordination
- DTO transformation
- Transaction management
- Event publishing

### 3. Domain Layer (`src/domain/`)
- Core business logic
- Business rules
- Domain entities
- Value objects
- Domain events
- Domain services

### 4. Infrastructure Layer (`src/infrastructure/`)
- Database access
- External API calls
- File storage
- Email sending
- Queue management
- Caching

### 5. Core Layer (`src/core/`)
- Shared types
- Common utilities
- Base classes
- Interfaces
- Constants

## Module Organization Pattern

Each feature module follows this structure:

```
feature/
├── dtos/
│   ├── CreateFeatureDto.ts
│   ├── UpdateFeatureDto.ts
│   └── FeatureResponseDto.ts
├── use-cases/
│   ├── CreateFeatureUseCase.ts
│   ├── GetFeatureUseCase.ts
│   └── UpdateFeatureUseCase.ts
├── FeatureService.ts
├── FeatureRepository.ts
├── FeatureController.ts
└── feature.routes.ts
```

## Dependency Flow

```
Presentation → Application → Domain ← Infrastructure
                                ↑
                              Core
```

**Rules:**
- Presentation depends on Application
- Application depends on Domain
- Infrastructure depends on Domain
- Domain depends on Core only
- Core has no dependencies

## Import Rules

```typescript
// ✅ Allowed
import { OrderEntity } from '@/domain/entities/Order.entity';
import { CreateOrderDto } from '@/application/dtos/order/CreateOrderDto';
import { OrderRepository } from '@/infrastructure/repositories/postgres/OrderRepository';

// ❌ Not allowed
// Domain importing from Application
// Domain importing from Infrastructure
// Application importing from Presentation
```

## Naming Conventions

### Files
- **Entities:** `Order.entity.ts`
- **DTOs:** `CreateOrderDto.ts`
- **Use Cases:** `CreateOrderUseCase.ts`
- **Services:** `OrderService.ts`
- **Repositories:** `OrderRepository.ts`
- **Controllers:** `OrderController.ts`
- **Routes:** `order.routes.ts`
- **Middleware:** `auth.middleware.ts`
- **Utils:** `encryption.util.ts`

### Classes
- **Entities:** `OrderEntity`
- **DTOs:** `CreateOrderDto`
- **Use Cases:** `CreateOrderUseCase`
- **Services:** `OrderService`
- **Repositories:** `OrderRepository`
- **Controllers:** `OrderController`
- **Errors:** `NotFoundError`

### Interfaces
- Prefix with `I`: `IOrderRepository`, `IUseCase`

### Types
- Suffix with `Type`: `OrderStatusType`, `PaymentMethodType`

## Path Aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@config/*": ["./src/config/*"],
      "@core/*": ["./src/core/*"],
      "@domain/*": ["./src/domain/*"],
      "@application/*": ["./src/application/*"],
      "@infrastructure/*": ["./src/infrastructure/*"],
      "@presentation/*": ["./src/presentation/*"],
      "@shared/*": ["./src/shared/*"]
    }
  }
}
```

## Testing Structure

```
tests/
├── unit/                    # Unit tests (isolated)
│   ├── domain/
│   ├── use-cases/
│   └── services/
│
├── integration/             # Integration tests (with DB)
│   ├── repositories/
│   └── external-services/
│
└── e2e/                     # End-to-end tests (full flow)
    ├── order-flow.test.ts
    └── payment-flow.test.ts
```

---

**Version:** 1.0  
**Last Updated:** 2024
