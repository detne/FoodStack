/**
 * Common Types (JSDoc Type Definitions)
 * Shared types used across the application
 */

/**
 * @typedef {Object} PaginationParams
 * @property {number} page
 * @property {number} limit
 * @property {string} [sortBy]
 * @property {'asc'|'desc'} [sortOrder]
 */

/**
 * @typedef {Object} PaginationMeta
 * @property {number} page
 * @property {number} limit
 * @property {number} total
 * @property {number} totalPages
 * @property {boolean} hasNext
 * @property {boolean} hasPrev
 */

/**
 * @template T
 * @typedef {Object} PaginatedResponse
 * @property {T[]} data
 * @property {PaginationMeta} pagination
 */

/**
 * @template T
 * @typedef {Object} SuccessResponse
 * @property {true} success
 * @property {T} data
 * @property {string} [message]
 * @property {string} timestamp
 */

/**
 * @typedef {Object} ErrorDetail
 * @property {string} code
 * @property {string} message
 * @property {any} [details]
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {false} success
 * @property {ErrorDetail} error
 * @property {string} timestamp
 */

/**
 * @template T
 * @typedef {SuccessResponse<T>|ErrorResponse} ApiResponse
 */

/**
 * @typedef {Object} TimestampFields
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} SoftDeleteFields
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {Date|null} deletedAt
 */

/**
 * @typedef {Object} AuditFields
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {Date|null} deletedAt
 * @property {string} [createdBy]
 * @property {string} [updatedBy]
 * @property {string} [deletedBy]
 */

/**
 * @typedef {Object} DateRangeFilter
 * @property {Date} [from]
 * @property {Date} [to]
 */

/**
 * @typedef {Object} SearchFilter
 * @property {string} [query]
 * @property {string[]} [fields]
 */

/**
 * @typedef {Object} BaseFilter
 * @property {SearchFilter} [search]
 * @property {DateRangeFilter} [dateRange]
 * @property {string[]} [status]
 */

/**
 * @typedef {string} UUID
 */

/**
 * @typedef {Date|string} Timestamp
 */

/**
 * @typedef {Object} Money
 * @property {number} amount
 * @property {string} currency
 */

/**
 * @typedef {Object} Coordinates
 * @property {number} latitude
 * @property {number} longitude
 */

/**
 * @typedef {Object} Address
 * @property {string} [street]
 * @property {string} [city]
 * @property {string} [state]
 * @property {string} country
 * @property {string} [postalCode]
 * @property {Coordinates} [coordinates]
 */

/**
 * @typedef {Object} ContactInfo
 * @property {string} [email]
 * @property {string} [phone]
 * @property {string} [alternatePhone]
 */

/**
 * @typedef {Object} UploadedFile
 * @property {string} url
 * @property {string} publicId
 * @property {string} format
 * @property {number} size
 * @property {number} [width]
 * @property {number} [height]
 */

/**
 * Order Status Enum
 * @typedef {'Pending'|'Confirmed'|'Preparing'|'Ready'|'Served'|'Completed'|'Cancelled'} OrderStatus
 */

/**
 * Payment Status Enum
 * @typedef {'Pending'|'Processing'|'Success'|'Failed'|'Refunded'|'PartialRefund'} PaymentStatus
 */

/**
 * Payment Method Enum
 * @typedef {'PayOS'|'Cash'|'CreditCard'|'DebitCard'|'BankTransfer'|'Momo'|'ZaloPay'} PaymentMethod
 */

/**
 * Table Status Enum
 * @typedef {'Available'|'Occupied'|'Reserved'|'OutOfService'|'Cleaning'} TableStatus
 */

/**
 * Reservation Status Enum
 * @typedef {'Pending'|'Confirmed'|'Cancelled'|'Seated'|'Completed'|'NoShow'} ReservationStatus
 */

/**
 * User Role Enum
 * @typedef {'Owner'|'Manager'|'Staff'|'Chef'|'Cashier'} UserRole
 */

/**
 * Subscription Status Enum
 * @typedef {'trial'|'active'|'expired'|'cancelled'|'suspended'|'past_due'} SubscriptionStatus
 */

/**
 * Service Request Type Enum
 * @typedef {'CALL_STAFF'|'REQUEST_WATER'|'REQUEST_NAPKIN'|'REQUEST_UTENSILS'|'REQUEST_BILL'|'REQUEST_MENU'|'COMPLAINT'|'OTHER'} ServiceRequestType
 */

/**
 * Service Request Status Enum
 * @typedef {'PENDING'|'ACKNOWLEDGED'|'IN_PROGRESS'|'RESOLVED'|'CANCELLED'} ServiceRequestStatus
 */

/**
 * @template T
 * @typedef {T|null} Nullable
 */

/**
 * @template T
 * @typedef {T|undefined} Optional
 */

/**
 * @template T
 * @template E
 * @typedef {Object} Result
 * @property {boolean} success
 * @property {T} [data]
 * @property {E} [error]
 */

/**
 * @template T
 * @template E
 * @typedef {Promise<Result<T, E>>} AsyncResult
 */

module.exports = {};
