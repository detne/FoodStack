// src/use-cases/service-request/assign.js
const { ValidationError } = require('../../exception/validation-error');
const { NotFoundError } = require('../../core/errors/NotFoundError');
const { ForbiddenError } = require('../../core/errors/ForbiddenError');

class AssignServiceRequestUseCase {
  constructor(serviceRequestRepository, userRepository, prisma) {
    this.serviceRequestRepository = serviceRequestRepository;
    this.userRepository = userRepository;
    this.prisma = prisma;
  }

  async execute(dto, managerId) {
    // 1. Find the service request
    const request = await this.serviceRequestRepository.findById(dto.requestId);
    if (!request) {
      throw new NotFoundError('SERVICE_REQUEST_NOT_FOUND', 'Service request not found');
    }

    // 2. Check if request is still pending
    if (request.data?.status !== 'PENDING') {
      throw new ValidationError('REQUEST_NOT_PENDING', 'Only pending requests can be assigned');
    }

    // 3. Get manager information
    const manager = await this.userRepository.findById(managerId);
    if (!manager) {
      throw new NotFoundError('MANAGER_NOT_FOUND', 'Manager not found');
    }

    // 4. Verify manager has permission (MANAGER or OWNER role)
    if (!['MANAGER', 'OWNER'].includes(manager.role)) {
      throw new ForbiddenError('INSUFFICIENT_PERMISSION', 'Only managers can assign requests');
    }

    // 5. Get staff information
    const staff = await this.userRepository.findById(dto.staffId);
    if (!staff) {
      throw new NotFoundError('STAFF_NOT_FOUND', 'Staff member not found');
    }

    // 6. Verify staff belongs to the same branch as the request
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
        throw new ForbiddenError('STAFF_NOT_IN_BRANCH', 'Staff is not in the same branch as the request');
      }
    }

    // 7. Verify manager belongs to the same restaurant
    if (manager.restaurant_id !== staff.restaurant_id) {
      throw new ForbiddenError('MANAGER_NOT_AUTHORIZED', 'Manager cannot assign staff from different restaurant');
    }

    // 8. Assign the request to staff
    const updatedRequest = await this.serviceRequestRepository.assign(dto.requestId, dto.staffId, managerId);

    // 9. Log activity
    await this.prisma.activity_logs.create({
      data: {
        id: require('uuid').v4(),
        user_id: managerId,
        restaurant_id: manager.restaurant_id,
        branch_id: request.branch_id,
        action: 'ASSIGN_SERVICE_REQUEST',
        entity_type: 'SERVICE_REQUEST',
        entity_id: dto.requestId,
        old_values: { status: 'PENDING' },
        new_values: { 
          status: 'ACKNOWLEDGED', 
          assignedStaffId: dto.staffId,
          assignedBy: managerId 
        },
        created_at: new Date(),
      },
    });

    // 10. TODO: Send notification to assigned staff
    // await this.notificationService.notifyStaff(dto.staffId, updatedRequest);

    return {
      requestId: updatedRequest.id,
      status: 'ACKNOWLEDGED',
      assignedTo: {
        id: staff.id,
        name: staff.full_name,
        email: staff.email,
      },
      assignedBy: {
        id: manager.id,
        name: manager.full_name,
        email: manager.email,
      },
      assignedAt: new Date(),
      title: updatedRequest.title,
      message: updatedRequest.message,
      requestType: updatedRequest.data.requestType,
      priority: updatedRequest.data.priority,
    };
  }
}

module.exports = { AssignServiceRequestUseCase };