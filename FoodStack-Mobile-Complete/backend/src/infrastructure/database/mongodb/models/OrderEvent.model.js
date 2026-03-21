/**
 * Order Event Model (MongoDB)
 * Tracks complete order lifecycle and changes
 */

const mongoose = require('mongoose');

const orderEventSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    tableId: {
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
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'ORDER_CREATED',
        'ITEM_ADDED',
        'ITEM_REMOVED',
        'ITEM_UPDATED',
        'STATUS_CHANGED',
        'PAYMENT_INITIATED',
        'PAYMENT_COMPLETED',
        'ORDER_CANCELLED',
      ],
      index: true,
    },
    performedBy: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    collection: 'order_events',
    timestamps: false,
  }
);

// Compound indexes for efficient queries
orderEventSchema.index({ orderId: 1, timestamp: -1 });
orderEventSchema.index({ restaurantId: 1, timestamp: -1 });
orderEventSchema.index({ action: 1, timestamp: -1 });

// TTL index - auto delete after 90 days
orderEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

/**
 * @typedef {Object} OrderEvent
 * @property {string} orderId
 * @property {string} tableId
 * @property {string} restaurantId
 * @property {string} branchId
 * @property {string} action
 * @property {string} performedBy
 * @property {Object} details
 * @property {Object} metadata
 * @property {Date} timestamp
 */

const OrderEvent = mongoose.model('OrderEvent', orderEventSchema);

module.exports = { OrderEvent };
