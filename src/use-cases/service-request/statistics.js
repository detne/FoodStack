// src/use-cases/service-request/statistics.js
const { ForbiddenError } = require('../../core/errors/ForbiddenError');
const { NotFoundError } = require('../../core/errors/NotFoundError');

class ServiceRequestStatisticsUseCase {
  constructor(serviceRequestRepository, userRepository, prisma) {
    this.serviceRequestRepository = serviceRequestRepository;
    this.userRepository = userRepository;
    this.prisma = prisma;
  }

  async execute(managerId, dto) {
    // 1. Get manager information
    const manager = await this.userRepository.findById(managerId);
    if (!manager) {
      throw new NotFoundError('MANAGER_NOT_FOUND', 'Manager not found');
    }

    // 2. Verify manager has permission (MANAGER or OWNER role)
    if (!['MANAGER', 'OWNER'].includes(manager.role)) {
      throw new ForbiddenError('INSUFFICIENT_PERMISSION', 'Only managers can view statistics');
    }

    // 3. Get manager's accessible branches
    let branchIds = [];
    if (manager.restaurant_id) {
      const restaurant = await this.prisma.restaurants.findUnique({
        where: { id: manager.restaurant_id },
        include: {
          branches: {
            select: { id: true },
          },
        },
      });
      branchIds = restaurant?.branches.map(b => b.id) || [];
    }

    if (branchIds.length === 0) {
      throw new ForbiddenError('NO_BRANCH_ACCESS', 'Manager has no branch access');
    }

    // 4. Filter by specific branch if provided
    let targetBranchIds = branchIds;
    if (dto.branchId) {
      if (!branchIds.includes(dto.branchId)) {
        throw new ForbiddenError('BRANCH_NOT_ACCESSIBLE', 'Manager cannot access this branch');
      }
      targetBranchIds = [dto.branchId];
    }

    // 5. Calculate date range based on period
    const dateRange = this.calculateDateRange(dto.period, dto.startDate, dto.endDate);

    // 6. Get statistics
    const [totalRequests, pendingRequests, resolvedRequests, acknowledgedRequests] = await Promise.all([
      // Total requests in period
      this.prisma.notifications.count({
        where: {
          branch_id: { in: targetBranchIds },
          type: 'SERVICE_REQUEST',
          created_at: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        },
      }),
      
      // Pending requests
      this.prisma.notifications.count({
        where: {
          branch_id: { in: targetBranchIds },
          type: 'SERVICE_REQUEST',
          created_at: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
          data: {
            path: ['status'],
            equals: 'PENDING',
          },
        },
      }),

      // Resolved requests
      this.prisma.notifications.count({
        where: {
          branch_id: { in: targetBranchIds },
          type: 'SERVICE_REQUEST',
          created_at: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
          data: {
            path: ['status'],
            equals: 'RESOLVED',
          },
        },
      }),

      // Acknowledged requests
      this.prisma.notifications.count({
        where: {
          branch_id: { in: targetBranchIds },
          type: 'SERVICE_REQUEST',
          created_at: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
          data: {
            path: ['status'],
            equals: 'ACKNOWLEDGED',
          },
        },
      }),
    ]);

    // 7. Calculate average response time
    const avgResponseTime = await this.calculateAverageResponseTime(targetBranchIds, dateRange);

    // 8. Get breakdown by request type
    const requestTypeBreakdown = await this.getRequestTypeBreakdown(targetBranchIds, dateRange);

    return {
      period: dto.period,
      dateRange: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
      statistics: {
        total_requests: totalRequests,
        pending_requests: pendingRequests,
        acknowledged_requests: acknowledgedRequests,
        resolved_requests: resolvedRequests,
        avg_response_time_minutes: avgResponseTime,
      },
      breakdown: {
        by_status: {
          pending: pendingRequests,
          acknowledged: acknowledgedRequests,
          resolved: resolvedRequests,
        },
        by_request_type: requestTypeBreakdown,
      },
    };
  }

  calculateDateRange(period, startDate, endDate) {
    const now = new Date();
    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      switch (period) {
        case 'day':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        case 'week':
          const dayOfWeek = now.getDay();
          start = new Date(now.getTime() - (dayOfWeek * 24 * 60 * 60 * 1000));
          start.setHours(0, 0, 0, 0);
          end = new Date(start.getTime() + (7 * 24 * 60 * 60 * 1000));
          break;
        case 'month':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        default:
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      }
    }

    return { startDate: start, endDate: end };
  }

  async calculateAverageResponseTime(branchIds, dateRange) {
    // Get resolved requests with response time data
    const resolvedRequests = await this.prisma.notifications.findMany({
      where: {
        branch_id: { in: branchIds },
        type: 'SERVICE_REQUEST',
        created_at: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
        data: {
          path: ['status'],
          equals: 'RESOLVED',
        },
      },
      select: {
        created_at: true,
        data: true,
      },
    });

    if (resolvedRequests.length === 0) {
      return 0;
    }

    let totalResponseTime = 0;
    let validRequests = 0;

    resolvedRequests.forEach(request => {
      const createdAt = new Date(request.created_at);
      const resolvedAt = request.data?.resolvedAt ? new Date(request.data.resolvedAt) : null;
      
      if (resolvedAt) {
        const responseTime = (resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60); // minutes
        totalResponseTime += responseTime;
        validRequests++;
      }
    });

    return validRequests > 0 ? Math.round((totalResponseTime / validRequests) * 100) / 100 : 0;
  }

  async getRequestTypeBreakdown(branchIds, dateRange) {
    const requests = await this.prisma.notifications.findMany({
      where: {
        branch_id: { in: branchIds },
        type: 'SERVICE_REQUEST',
        created_at: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      },
      select: {
        data: true,
      },
    });

    const breakdown = {};
    requests.forEach(request => {
      const requestType = request.data?.requestType || 'UNKNOWN';
      breakdown[requestType] = (breakdown[requestType] || 0) + 1;
    });

    return breakdown;
  }
}

module.exports = { ServiceRequestStatisticsUseCase };