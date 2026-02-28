/**
 * Service Request Model (MongoDB)
 * Customer service requests at tables (call staff, water, etc.)
 */

const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: String,
      required: true,
      index: true,
    },
    branchId: {
      type: String,
      required: true,
      index: true,
    },
    tableId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    requestType: {
      type: String,
      required: true,
      enum: [
        'CALL_STAFF',
        'REQUEST_WATER',
        'REQUEST_NAPKIN',
        'REQUEST_UTENSILS',
        'REQUEST_BILL',
        'REQUEST_MENU',
        'COMPLAINT',
        'OTHER',
      ],
    },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
      default: 'NORMAL',
    },
    message: {
      type: String,
    },
    assignedTo: {
      type: String,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    acknowledgedAt: {
      type: Date,
    },
    resolvedAt: {
      type: Date,
    },
    responseTimeSeconds: {
      type: Number,
    },
  },
  {
    collection: 'service_requests',
    timestamps: false,
  }
);

// Compound indexes
serviceRequestSchema.index({ restaurantId: 1, status: 1, createdAt: -1 });
serviceRequestSchema.index({ branchId: 1, status: 1, createdAt: -1 });
serviceRequestSchema.index({ tableId: 1, status: 1 });

// TTL index - auto delete after 24 hours
serviceRequestSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

/**
 * Calculate response time when resolved
 */
serviceRequestSchema.pre('save', function (next) {
  if (this.isModified('resolvedAt') && this.resolvedAt && this.createdAt) {
    this.responseTimeSeconds = Math.floor(
      (this.resolvedAt.getTime() - this.createdAt.getTime()) / 1000
    );
  }
  next();
});

/**
 * @typedef {Object} ServiceRequest
 * @property {string} restaurantId
 * @property {string} branchId
 * @property {string} tableId
 * @property {string} sessionId
 * @property {string} requestType
 * @property {string} status
 * @property {string} priority
 * @property {string} message
 * @property {string} assignedTo
 * @property {Date} createdAt
 * @property {Date} acknowledgedAt
 * @property {Date} resolvedAt
 * @property {number} responseTimeSeconds
 */

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

module.exports = { ServiceRequest };
