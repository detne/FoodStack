// src/use-cases/service-request/acknowledge.js
const { ValidationError } = require('../../exception/validation-error');
const { NotFoundError } = require('../../core/errors/NotFoundError');
const { ForbiddenError } = require('../../core/errors/ForbiddenError');

class AcknowledgeServiceRequestUseCase {
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

    // 2. Check if already acknowledged
    if (request.data?.status === 'ACKNOWLEDGED') {
      throw new ValidationError('REQUEST_ALREADY_ACKNOWLEDGED', 'Request has already been acknowledged');
    }

    // 3. Get staff information
    const staff = await this.userRepository.findById(staffId);
    if (!staff) {
      throw new NotFoundError('STAFF_NOT_FOUND', 'Staff member not found');
    }

    // 4. Verify staff belongs to the same branch
    if (staff.restaurant_id) {
      // Check if staff's restaurant has the branch
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

    // 5. Acknowledge the request
    const updatedRequest = await this.serviceRequestRepository.acknowledge(dto.requestId, staffId);

    // 6. Log activity
    await this.prisma.activity_logs.create({
      data: {
        id: require('uuid').v4(),
        user_id: staffId,
        restaurant_id: staff.restaurant_id,
        branch_id: request.branch_id,
        action: 'ACKNOWLEDGE_SERVICE_REQUEST',
        entity_type: 'SERVICE_REQUEST',
        entity_id: dto.requestId,
        old_values: { status: 'PENDING' },
        new_values: { status: 'ACKNOWLEDGED', staffId },
        created_at: new Date(),
      },
    });

    return {
      requestId: updatedRequest.id,
      status: 'ACKNOWLEDGED',
      acknowledgedBy: {
        id: staff.id,
        name: staff.full_name,
        email: staff.email,
      },
      acknowledgedAt: new Date(),
      title: updatedRequest.title,
      message: updatedRequest.message,
      requestType: updatedRequest.data.requestType,
      priority: updatedRequest.data.priority,
    };
  }
}

module.exports = { AcknowledgeServiceRequestUseCase };