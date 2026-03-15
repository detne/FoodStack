// src/use-cases/service-request/list-by-branch.js
const { ForbiddenError } = require('../../core/errors/ForbiddenError');
const { NotFoundError } = require('../../core/errors/NotFoundError');

class ListServiceRequestsByBranchUseCase {
  constructor(serviceRequestRepository, userRepository, prisma) {
    this.serviceRequestRepository = serviceRequestRepository;
    this.userRepository = userRepository;
    this.prisma = prisma;
  }

  async execute(staffId, status = null) {
    // 1. Get staff information
    const staff = await this.userRepository.findById(staffId);
    if (!staff) {
      throw new NotFoundError('STAFF_NOT_FOUND', 'Staff member not found');
    }

    // 2. Get staff's branches
    let branchIds = [];
    if (staff.restaurant_id) {
      const restaurant = await this.prisma.restaurants.findUnique({
        where: { id: staff.restaurant_id },
        include: {
          branches: {
            select: { id: true },
          },
        },
      });
      branchIds = restaurant?.branches.map(b => b.id) || [];
    }

    if (branchIds.length === 0) {
      throw new ForbiddenError('NO_BRANCH_ACCESS', 'Staff has no branch access');
    }

    // 3. Get service requests for staff's branches
    const requests = await this.prisma.notifications.findMany({
      where: {
        branch_id: { in: branchIds },
        type: 'SERVICE_REQUEST',
        ...(status && {
          data: {
            path: ['status'],
            equals: status,
          },
        }),
      },
      orderBy: { created_at: 'desc' },
      take: 50, // Limit to 50 recent requests
    });

    // 4. Format response
    return requests.map(request => ({
      id: request.id,
      title: request.title,
      message: request.message,
      requestType: request.data?.requestType,
      priority: request.data?.priority || 'NORMAL',
      status: request.data?.status || 'PENDING',
      tableId: request.data?.tableId,
      branchId: request.branch_id,
      createdAt: request.created_at,
      acknowledgedBy: request.data?.staffId ? {
        id: request.data.staffId,
        acknowledgedAt: request.data.acknowledgedAt,
      } : null,
      isRead: request.is_read,
    }));
  }
}

module.exports = { ListServiceRequestsByBranchUseCase };