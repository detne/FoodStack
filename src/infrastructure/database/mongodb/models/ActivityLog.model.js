/**
 * Activity Log Model (MongoDB)
 * System audit trail for all actions
 */

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    restaurantId: {
      type: String,
      required: true,
      index: true,
    },
    branchId: {
      type: String,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entity: {
      type: String,
      required: true,
      index: true,
    },
    entityId: {
      type: String,
      required: true,
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    severity: {
      type: String,
      enum: ['INFO', 'WARNING', 'ERROR', 'CRITICAL'],
      default: 'INFO',
      index: true,
    },
  },
  {
    collection: 'activity_logs',
    timestamps: false,
  }
);

// Compound indexes
activityLogSchema.index({ restaurantId: 1, timestamp: -1 });
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ entity: 1, entityId: 1, timestamp: -1 });

// TTL index - auto delete after 1 year
activityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

/**
 * @typedef {Object} ActivityLog
 * @property {string} userId
 * @property {string} restaurantId
 * @property {string} branchId
 * @property {string} action
 * @property {string} entity
 * @property {string} entityId
 * @property {Object} oldValue
 * @property {Object} newValue
 * @property {string} ipAddress
 * @property {string} userAgent
 * @property {Date} timestamp
 * @property {string} severity
 */

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = { ActivityLog };
