/**
 * Order Event Repository
 * Data access layer for order events (MongoDB)
 */

const { OrderEvent } = require('../../database/mongodb/models');
const { DatabaseError } = require('../../../core/errors');

class OrderEventRepository {
  /**
   * Create order event
   * @param {Object} eventData
   * @returns {Promise<Object>}
   */
  async create(eventData) {
    try {
      const event = new OrderEvent({
        ...eventData,
        timestamp: new Date(),
      });
      return await event.save();
    } catch (error) {
      throw new DatabaseError(error.message, 'OrderEventRepository.create');
    }
  }

  /**
   * Get order lifecycle events
   * @param {string} orderId
   * @returns {Promise<Object[]>}
   */
  async getOrderLifecycle(orderId) {
    try {
      return await OrderEvent.find({ orderId })
        .sort({ timestamp: 1 })
        .lean();
    } catch (error) {
      throw new DatabaseError(error.message, 'OrderEventRepository.getOrderLifecycle');
    }
  }

  /**
   * Get events by restaurant and date range
   * @param {string} restaurantId
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Object[]>}
   */
  async getByRestaurantAndDateRange(restaurantId, startDate, endDate) {
    try {
      return await OrderEvent.find({
        restaurantId,
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      })
        .sort({ timestamp: -1 })
        .lean();
    } catch (error) {
      throw new DatabaseError(error.message, 'OrderEventRepository.getByRestaurantAndDateRange');
    }
  }

  /**
   * Get events by action type
   * @param {string} restaurantId
   * @param {string} action
   * @param {number} limit
   * @returns {Promise<Object[]>}
   */
  async getByAction(restaurantId, action, limit = 100) {
    try {
      return await OrderEvent.find({
        restaurantId,
        action,
      })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      throw new DatabaseError(error.message, 'OrderEventRepository.getByAction');
    }
  }

  /**
   * Get recent events by table
   * @param {string} tableId
   * @param {number} limit
   * @returns {Promise<Object[]>}
   */
  async getRecentByTable(tableId, limit = 50) {
    try {
      return await OrderEvent.find({ tableId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      throw new DatabaseError(error.message, 'OrderEventRepository.getRecentByTable');
    }
  }

  /**
   * Get event statistics
   * @param {string} restaurantId
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Object>}
   */
  async getStatistics(restaurantId, startDate, endDate) {
    try {
      const stats = await OrderEvent.aggregate([
        {
          $match: {
            restaurantId,
            timestamp: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 },
          },
        },
      ]);

      return stats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});
    } catch (error) {
      throw new DatabaseError(error.message, 'OrderEventRepository.getStatistics');
    }
  }
}

module.exports = { OrderEventRepository };
