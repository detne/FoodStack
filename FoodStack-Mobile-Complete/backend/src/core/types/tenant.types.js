/**
 * Tenant Context Types (JSDoc Type Definitions)
 * Multi-tenancy related types
 */

/**
 * @typedef {Object} TenantFeatures
 * @property {number} maxBranches
 * @property {number} maxTables
 * @property {boolean} hasSplitBill
 * @property {boolean} hasFeedback
 * @property {boolean} hasAnalytics
 * @property {boolean} hasReservation
 * @property {boolean} hasQrService
 */

/**
 * @typedef {Object} TenantContext
 * @property {string} restaurantId
 * @property {string} restaurantName
 * @property {string} subscriptionPlan
 * @property {string} subscriptionStatus
 * @property {TenantFeatures} features
 */

/**
 * @typedef {Object} UserContext
 * @property {string} userId
 * @property {string} email
 * @property {string} fullName
 * @property {import('./common.types').UserRole} role
 * @property {string} [branchId]
 * @property {string[]} permissions
 */

/**
 * @typedef {Object} RequestContext
 * @property {string} requestId
 * @property {TenantContext} tenant
 * @property {UserContext} [user]
 * @property {string} ip
 * @property {string} userAgent
 * @property {Date} timestamp
 */

/**
 * @typedef {Object} TenantIsolated
 * @property {string} restaurantId
 */

/**
 * @typedef {Object} BranchIsolated
 * @property {string} restaurantId
 * @property {string} branchId
 */

/**
 * @typedef {Object} TenantQueryOptions
 * @property {string} restaurantId
 * @property {string} [branchId]
 * @property {boolean} [includeDeleted]
 */

/**
 * @typedef {Object} SubscriptionLimits
 * @property {number} maxBranches
 * @property {number} maxTables
 * @property {number} maxUsers
 * @property {number} maxMenuItems
 * @property {number} maxOrdersPerMonth
 * @property {string[]} features
 */

/**
 * @typedef {Object} TenantMetrics
 * @property {string} restaurantId
 * @property {number} totalBranches
 * @property {number} totalTables
 * @property {number} totalUsers
 * @property {number} totalOrders
 * @property {number} totalRevenue
 * @property {boolean} activeSubscription
 */

module.exports = {};
