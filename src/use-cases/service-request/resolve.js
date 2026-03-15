// src/use-cases/service-request/resolve.js
const { ValidationError } = require('../../exception/validation-error');
const { NotFoundError } = require('../../core/errors/NotFoundError');
const { ForbiddenError } = require('../../core/errors/ForbiddenError');

class ResolveServiceRequestUseCase {
  constructor(serviceRequestRepository, userRepository, prisma) {
    this.serviceRequestRepository = serviceRequestRepository;
    this.userRepository = userRepository;
    this.prisma = prisma;
  }

  async execute(dto, staffId) {
    // 1. Find the service request
    const request = await this.serviceRequestRepository.findById(dto.requestId);
    if (!request) {
      throw new NotFoundError('SERVICE_REQUEST_NOT_FOUND', 'Service request not found');
    }

    // 2. Check if request is acknowledged
    if (request.data?.status !== 'ACKNOWLEDGED') {
      throw new ValidationError('REQUEST_NOT_ACKNOWLEDGED', 'Request must be acknowledged before resolving');
    }

    // 3. Check if already resolved
    if (request.data?.status === 'RESOLVED') {
      throw new ValidationError('REQUEST_ALREADY_RESOLVED', 'Request has already been resolved');
    }

    // 4. Get staff information
    const staff = await this.userRepository.findById(staffId);
    if (!staff) {
      throw new NotFoundError('STAFF_NOT_FOUND', 'Staff member not found');
    }

    // 5. Verify staff belongs to the same branch
    if (staff.restaurant_id) {
      const staffRestaurant = await this.prisma.restaurants.findUnique({
        where: { id: staff.restaurant_id },
        include: {
          branches: {
            where: { id: request.branch_id },
          },
        },
      });

      if (!staffRestaurant || staffRestaurant.branches.length === 0) {
        throw new ForbiddenError('STAFF_NOT_AUTHORIZED', 'Staff is not authorized for this branch');
      }
    }

    // 6. Business rule: Only staff who acknowledged can resolve
    if (request.data?.staffId !== staffId) {
      throw new ForbiddenError('STAFF_NOT_OWNER', 'Only the staff who acknowledged this request can resolve it');
    }

    // 7. Resolve the request
    const updatedRequest = await this.serviceRequestRepository.resolve(dto.requestId, staffId);

    // 8. Log activity
    await this.prisma.activity_logs.create({
      data: {
        id: require('uuid').v4(),
        user_id: staffId,
        restaurant_id: staff.restaurant_id,
        branch_id: request.branch_id,
        action: 'RESOLVE_SERVICE_REQUEST',
        entity_type: 'SERVICE_REQUEST',
        entity_id: dto.requestId,
        old_values: { status: 'ACKNOWLEDGED' },
        new_values: { status: 'RESOLVED', resolvedBy: staffId },
        created_at: new Date(),
      },
    });

    return {
      requestId: updatedRequest.id,
      status: 'RESOLVED',
      resolvedBy: {
        id: staff.id,
        name: staff.full_name,
        email: staff.email,
      },
      resolvedAt: new Date(),
      title: updatedRequest.title,
      message: updatedRequest.message,
      requestType: updatedRequest.data.requestType,
      priority: updatedRequest.data.priority,
      acknowledgedBy: {
        id: updatedRequest.data.staffId,
        acknowledgedAt: updatedRequest.data.acknowledgedAt,
      },
    };
  }
}

module.exports = { ResolveServiceRequestUseCase };