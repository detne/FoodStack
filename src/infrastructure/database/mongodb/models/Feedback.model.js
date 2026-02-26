/**
 * Feedback Model (MongoDB)
 * Customer feedback and ratings
 */

const mongoose = require('mongoose');

const dishRatingSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    note: {
      type: String,
    },
  },
  { _id: false }
);

const feedbackResponseSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    respondedBy: {
      type: String,
      required: true,
    },
    respondedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const feedbackSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
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
    tableId: {
      type: String,
    },
    sessionId: {
      type: String,
    },
    overallRating: {
      type: Number,
      min: 1,
      max: 5,
      index: true,
    },
    foodRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    serviceRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    ambianceRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
    dishRatings: [dishRatingSchema],
    images: [String],
    tags: [String],
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    customerName: {
      type: String,
    },
    customerEmail: {
      type: String,
    },
    response: feedbackResponseSchema,
    sentiment: {
      type: String,
      enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'],
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    collection: 'feedbacks',
    timestamps: false,
  }
);

// Indexes
feedbackSchema.index({ restaurantId: 1, createdAt: -1 });
feedbackSchema.index({ branchId: 1, createdAt: -1 });
feedbackSchema.index({ overallRating: 1, createdAt: -1 });
feedbackSchema.index({ 'dishRatings.itemId': 1 });
feedbackSchema.index({ tags: 1 });

// Text search index
feedbackSchema.index({ comment: 'text', 'dishRatings.note': 'text' });

/**
 * Auto-detect sentiment based on rating
 */
feedbackSchema.pre('save', function (next) {
  if (this.isModified('overallRating') && this.overallRating) {
    if (this.overallRating >= 4) {
      this.sentiment = 'POSITIVE';
    } else if (this.overallRating >= 3) {
      this.sentiment = 'NEUTRAL';
    } else {
      this.sentiment = 'NEGATIVE';
    }
  }
  next();
});

/**
 * @typedef {Object} DishRating
 * @property {string} itemId
 * @property {string} itemName
 * @property {number} rating
 * @property {string} note
 */

/**
 * @typedef {Object} FeedbackResponse
 * @property {string} message
 * @property {string} respondedBy
 * @property {Date} respondedAt
 */

/**
 * @typedef {Object} Feedback
 * @property {string} orderId
 * @property {string} restaurantId
 * @property {string} branchId
 * @property {string} tableId
 * @property {number} overallRating
 * @property {number} foodRating
 * @property {number} serviceRating
 * @property {number} ambianceRating
 * @property {string} comment
 * @property {DishRating[]} dishRatings
 * @property {string[]} images
 * @property {string[]} tags
 * @property {boolean} isAnonymous
 * @property {string} customerName
 * @property {string} customerEmail
 * @property {FeedbackResponse} response
 * @property {string} sentiment
 * @property {Date} createdAt
 */

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = { Feedback };
