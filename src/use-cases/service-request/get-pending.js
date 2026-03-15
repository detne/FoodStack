// src/use-cases/service-request/get-pending.js
const { ForbiddenError } = require('../../core/errors/ForbiddenError');
const { NotFoundError } = require('../../core/errors/NotFoundError');

class GetPendingServiceRequestsUseCase {
  constructor(serviceRequestRepository, userRepository, prisma) {
    this.serviceRequestRepository = serviceRequestRepository;
    this.userRepository = userRepository;
    this.prisma = prisma;
  }

  async execute(staffId, dto) {
    // 1. Get staff information
    const staff = await this.userRepository.findById(staffId);
    if (!staff) {
      throw new NotFoundError('STAFF_NOT_FOUND', 'Staff member not found');
    }

    // 2. Get staff's accessible branches
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

    // 3. Filter by specific branch if provided
    let targetBranchIds = branchIds;
    if (dto.branchId) {
      if (!branchIds.includes(dto.branchId)) {
        throw new ForbiddenError('BRANCH_NOT_ACCESSIBLE', 'Staff cannot access this branch');
      }
      targetBranchIds = [dto.branchId];
    }

    // 4. Calculate pagination
    const skip = (dto.page - 1) * dto.limit;

    // 5. Get pending service requests with pagination
    const [requests, totalCount] = await Promise.all([
      this.prisma.notifications.findMany({
        where: {
          branch_id: { in: targetBranchIds },
          type: 'SERVICE_REQUEST',
          data: {
            path: ['status'],
            equals: 'PENDING',
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: dto.limit,
      }),
      this.prisma.notifications.count({
        where: {
          branch_id: { in: targetBranchIds },
          type: 'SERVICE_REQUEST',
          data: {
            path: ['status'],
            equals: 'PENDING',
          },
        },
      }),
    ]);

    // 6. Get table information for each request
    const requestsWithTableInfo = await Promise.all(
      requests.map(async (request) => {
        let tableInfo = null;
        if (request.data?.tableId) {
          const table = await this.prisma.tables.findUnique({
            where: { id: request.data.tableId },
            select: {
              id: true,
              table_number: true,
              areas: {
                select: {
                  name: true,
                },
              },
            },
          });
          tableInfo = table;
        }

        return {
          request_id: request.id,
          table_number: tableInfo?.table_number || 'Unknown',
          table_area: tableInfo?.areas?.name || 'Unknown',
          request_type: request.data?.requestType || 'UNKNOWN',
          message: request.message,
          priority: request.data?.priority || 'NORMAL',
          created_at: request.created_at,
          branch_id: request.branch_id,
        };
      })
    );

    // 7. Calculate pagination info
    const totalPages = Math.ceil(totalCount / dto.limit);
    const hasNextPage = dto.page < totalPages;
    const hasPrevPage = dto.page > 1;

    return {
      requests: requestsWithTableInfo,
      pagination: {
        page: dto.page,
        limit: dto.limit,
        total: totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };
  }
}

module.exports = { GetPendingServiceRequestsUseCase };