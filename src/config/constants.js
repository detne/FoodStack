/**
 * Application Constants
 * Centralized constants used across the application
 */

// =====================================================
// Cache Keys
// =====================================================

const CACHE_KEYS = {
  // Menu
  MENU_BY_BRANCH: (branchId) => `menu:branch:${branchId}`,
  MENU_ITEM: (itemId) => `menu:item:${itemId}`,
  MENU_CATEGORY: (categoryId) => `menu:category:${categoryId}`,

  // Table
  TABLE: (tableId) => `table:${tableId}`,
  TABLE_BY_QR: (qrToken) => `table:qr:${qrToken}`,
  TABLE_STATUS: (tableId) => `table:status:${tableId}`,
  TABLES_BY_BRANCH: (branchId) => `tables:branch:${branchId}`,

  // Order
  ORDER: (orderId) => `order:${orderId}`,
  ACTIVE_ORDERS: (branchId) => `orders:active:${branchId}`,
  ORDER_SESSION: (sessionId) => `order:session:${sessionId}`,

  // User
  USER: (userId) => `user:${userId}`,
  USER_PERMISSIONS: (userId) => `user:permissions:${userId}`,

  // Restaurant
  RESTAURANT: (restaurantId) => `restaurant:${restaurantId}`,
  SUBSCRIPTION: (restaurantId) => `subscription:${restaurantId}`,

  // Analytics
  ANALYTICS: (restaurantId, period) => `analytics:${restaurantId}:${period}`,
};

// =====================================================
// Cache TTL (in seconds)
// =====================================================

const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
  MENU: 7200, // 2 hours
  TABLE: 1800, // 30 minutes
  SESSION: 86400, // 24 hours
  USER: 3600, // 1 hour
};

// =====================================================
// Event Names
// =====================================================

const EVENTS = {
  // Order Events
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_STATUS_CHANGED: 'order.status_changed',
  ORDER_CANCELLED: 'order.cancelled',
  ORDER_COMPLETED: 'order.completed',

  // Payment Events
  PAYMENT_INITIATED: 'payment.initiated',
  PAYMENT_SUCCESS: 'payment.success',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',

  // Table Events
  TABLE_OCCUPIED: 'table.occupied',
  TABLE_AVAILABLE: 'table.available',
  TABLE_RESERVED: 'table.reserved',

  // Service Request Events
  SERVICE_REQUEST_CREATED: 'service_request.created',
  SERVICE_REQUEST_ACKNOWLEDGED: 'service_request.acknowledged',
  SERVICE_REQUEST_RESOLVED: 'service_request.resolved',
};

// =====================================================
// WebSocket Rooms
// =====================================================

const WS_ROOMS = {
  RESTAURANT: (restaurantId) => `restaurant:${restaurantId}`,
  BRANCH: (branchId) => `branch:${branchId}`,
  TABLE: (tableId) => `table:${tableId}`,
  KITCHEN: (branchId) => `kitchen:${branchId}`,
  STAFF: (branchId) => `staff:${branchId}`,
  ADMIN: (restaurantId) => `admin:${restaurantId}`,
};

// =====================================================
// Permissions
// =====================================================

const PERMISSIONS = {
  // Order Permissions
  ORDER_CREATE: 'order:create',
  ORDER_READ: 'order:read',
  ORDER_UPDATE: 'order:update',
  ORDER_DELETE: 'order:delete',
  ORDER_CANCEL: 'order:cancel',

  // Menu Permissions
  MENU_CREATE: 'menu:create',
  MENU_READ: 'menu:read',
  MENU_UPDATE: 'menu:update',
  MENU_DELETE: 'menu:delete',

  // Table Permissions
  TABLE_CREATE: 'table:create',
  TABLE_READ: 'table:read',
  TABLE_UPDATE: 'table:update',
  TABLE_DELETE: 'table:delete',

  // User Permissions
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  // Analytics Permissions
  ANALYTICS_READ: 'analytics:read',
  ANALYTICS_EXPORT: 'analytics:export',
};

// =====================================================
// Role Permissions Mapping
// =====================================================

const ROLE_PERMISSIONS = {
  Owner: Object.values(PERMISSIONS),
  Manager: [
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_READ,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.ORDER_CANCEL,
    PERMISSIONS.MENU_CREATE,
    PERMISSIONS.MENU_READ,
    PERMISSIONS.MENU_UPDATE,
    PERMISSIONS.TABLE_CREATE,
    PERMISSIONS.TABLE_READ,
    PERMISSIONS.TABLE_UPDATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.ANALYTICS_READ,
  ],
  Staff: [
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_READ,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.MENU_READ,
    PERMISSIONS.TABLE_READ,
    PERMISSIONS.TABLE_UPDATE,
  ],
  Chef: [
    PERMISSIONS.ORDER_READ,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.MENU_READ,
  ],
  Cashier: [
    PERMISSIONS.ORDER_READ,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.MENU_READ,
  ],
};

// =====================================================
// Pagination Defaults
// =====================================================

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// =====================================================
// Business Rules
// =====================================================

const BUSINESS_RULES = {
  // Order
  ORDER_TIMEOUT_MINUTES: 120,
  ORDER_CANCELLATION_WINDOW_MINUTES: 5,
  MAX_ORDER_ITEMS: 50,

  // Payment
  PAYMENT_TIMEOUT_MINUTES: 15,
  PAYMENT_RETRY_ATTEMPTS: 3,
  MIN_ORDER_AMOUNT: 10000, // 10,000 VND
  MAX_ORDER_AMOUNT: 100000000, // 100M VND

  // Reservation
  RESERVATION_BUFFER_HOURS: 2,
  RESERVATION_MAX_ADVANCE_DAYS: 30,
  RESERVATION_MIN_PARTY_SIZE: 1,
  RESERVATION_MAX_PARTY_SIZE: 50,

  // Table
  MIN_TABLE_CAPACITY: 1,
  MAX_TABLE_CAPACITY: 50,

  // Tax & Service Charge
  DEFAULT_TAX_RATE: 0.1, // 10%
  DEFAULT_SERVICE_CHARGE_RATE: 0.05, // 5%
};

// =====================================================
// Error Codes
// =====================================================

const ERROR_CODES = {
  // General
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',

  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',

  // Order
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  ORDER_ALREADY_PAID: 'ORDER_ALREADY_PAID',
  ORDER_CANCELLED: 'ORDER_CANCELLED',

  // Payment
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_ALREADY_PROCESSED: 'PAYMENT_ALREADY_PROCESSED',
  PAYMENT_TIMEOUT: 'PAYMENT_TIMEOUT',

  // Database
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
};

// =====================================================
// HTTP Status Codes
// =====================================================

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

module.exports = {
  CACHE_KEYS,
  CACHE_TTL,
  EVENTS,
  WS_ROOMS,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  PAGINATION,
  BUSINESS_RULES,
  ERROR_CODES,
  HTTP_STATUS,
};
