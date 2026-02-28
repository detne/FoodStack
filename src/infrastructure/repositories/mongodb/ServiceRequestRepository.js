/**
 * Service Request Repository
 * Data access layer for service requests (MongoDB)
 */

const { ServiceRequest } = require('../../database/mongodb/models');
const { DatabaseError, NotFoundError } = require('../../../core/errors');

class ServiceRequestRepository {
  /**
   * Create service request
   * @param {Object} requestData
   * @returns {Promise<Object>}
   */
  async create(requestData) {
    try {
      const request = new ServiceRequest({
        ...requestData,
        createdAt: new Date(),
      });
      return await request.save();
    } catch (error) {
      throw new DatabaseError(error.message, 'ServiceRequestRepository.create');
    }
  }

  /**
   * Get pending requests by branch
   * @param {string} branchId
   * @returns {Promise<Object[]>}
   */
  async getPendingByBranch(branchId) {
    try {
      return await ServiceRequest.find({
        branchId,
        status: { $in: ['PENDING', 'ACKNOWLEDGED', 'IN_PROGRESS'] },
      })
        .sort({ priority: -1, createdAt: 1 })
        .lean();
    } catch (error) {
      throw new DatabaseError(error.message, 'ServiceRequestRepository.getPendingByBranch');
    }
  }

  /**
   * Get requests by table
   * @param {string} tableId
   * @param {number} limit
   * @returns {Promise<Object[]>}
   */
  async getByTable(tableId, limit = 20) {
    try {
      return await ServiceRequest.find({ tableId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      throw new DatabaseError(error.message, 'ServiceRequestRepository.getByTable');
    }
  }

  /**
   * Update request status
   * @param {string} requestId
   * @param {string} status
   * @param {string} assignedTo
   * @returns {Promise<Object>}
   */
  async updateStatus(requestId, status, assignedTo = null) {
    try {
      const updateData = { status };
      
      if (status === 'ACKNOWLEDGED' && !assignedTo) {
        updateData.acknowledgedAt = new Date();
      }
      
      if (status === 'RESOLVED') {
        updateData.resolvedAt = new Date();
      }
      
      if (assignedTo) {
        updateData.assignedTo = assignedTo;
      }

      const request = await ServiceRequest.findByIdAndUpdate(
        requestId,
        updateData,
        { new: true }
      );

      if (!request) {
        throw new NotFoundError('Service Request', requestId);
      }

      return request;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(error.message, 'ServiceRequestRepository.updateStatus');
    }
  }

  /**
   * Assign request to staff
   * @param {string} requestId
   * @param {string} staffId
   * @returns {Promise<Object>}
   */
  async assignToStaff(requestId, staffId) {
    try {
      const request = await ServiceRequest.findByIdAndUpdate(
        requestId,
        {
          assignedTo: staffId,
          status: 'ACKNOWLEDGED',
          acknowledgedAt: new Date(),
        },
        { new: true }
      );

      if (!request) {
        throw new NotFoundError('Service Request', requestId);
      }

      return request;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(error.message, 'ServiceRequestRepository.assignToStaff');
    }
  }

  /**
   * Get average response time
   * @param {string} restaurantId
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<number>}
   */
  async getAverageResponseTime(restaurantId, startDate, endDate) {
    try {
      const result = await ServiceRequest.aggregate([
        {
          $match: {
            restaurantId,
            status: 'RESOLVED',
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
            responseTimeSeconds: { $exists: true },
          },
        },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$responseTimeSeconds' },
          },
        },
      ]);

      return result.length > 0 ? result[0].avgResponseTime : 0;
    } catch (error) {
      throw new DatabaseError(error.message, 'ServiceRequestRepository.getAverageResponseTime');
    }
  }

  /**
   * Get request statistics
   * @param {string} restaurantId
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Object>}
   */
  async getStatistics(restaurantId, startDate, endDate) {
    try {
      const [totalRequests, byType, byStatus, avgResponseTime] = await Promise.all([
        ServiceRequest.countDocuments({
          restaurantId,
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        }),
        ServiceRequest.aggregate([
          {
            $match: {
              restaurantId,
              createdAt: {
                $gte: startDate,
                $lte: endDate,
              },
            },
          },
          {
            $group: {
              _id: '$requestType',
              count: { $sum: 1 },
            },
          },
        ]),
        ServiceRequest.aggregate([
          {
            $match: {
              restaurantId,
              createdAt: {
                $gte: startDate,
                $lte: endDate,
              },
            },
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]),
        this.getAverageResponseTime(restaurantId, startDate, endDate),
      ]);

      return {
        totalRequests,
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byStatus: byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        avgResponseTime: Math.round(avgResponseTime),
      };
    } catch (error) {
      throw new DatabaseError(error.message, 'ServiceRequestRepository.getStatistics');
    }
  }
}

module.exports = { ServiceRequestRepository };
