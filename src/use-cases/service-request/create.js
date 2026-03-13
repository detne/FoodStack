// src/use-cases/service-request/create.js
const { ValidationError } = require('../../exception/validation-error');
const { NotFoundError } = require('../../core/errors/NotFoundError');

class CreateServiceRequestUseCase {
  constructor(serviceRequestRepository, tableRepository, prisma) {
    this.serviceRequestRepository = serviceRequestRepository;
    this.tableRepository = tableRepository;
    this.prisma = prisma;
  }

  async execute(dto) {
    // 1. Validate table by QR token
    const table = await this.prisma.tables.findUnique({
      where: { qr_token: dto.qrToken },
      include: {
        areas: {
          include: {
            branches: {
              include: {
                restaurants: true,
              },
            },
          },
        },
      },
    });

    if (!table) {
      throw new NotFoundError('INVALID_QR_TOKEN', 'Table not found with this QR code');
    }

    if (table.deleted_at) {
      throw new ValidationError('TABLE_NOT_FOUND', 'Table has been deleted');
    }

    const branch = table.areas?.branches;
    const restaurant = branch?.restaurants;

    if (!branch || !restaurant) {
      throw new ValidationError('INVALID_TABLE', 'Table does not belong to a valid branch');
    }

    // 2. Create service request in PostgreSQL (notifications table)
    const serviceRequest = await this.serviceRequestRepository.create({
      restaurantId: restaurant.id,
      branchId: branch.id,
      tableId: table.id,
      requestType: dto.requestType,
      message: dto.message || null,
      priority: this.determinePriority(dto.requestType),
    });

    // 3. TODO: Send notification to staff (implement later)
    // await this.notificationService.notifyStaff(serviceRequest);

    return {
      requestId: serviceRequest.id,
      tableNumber: table.table_number,
      branchName: branch.name,
      requestType: serviceRequest.data.requestType,
      status: 'PENDING',
      priority: serviceRequest.data.priority,
      message: serviceRequest.message,
      createdAt: serviceRequest.created_at,
    };
  }

  determinePriority(requestType) {
    const priorityMap = {
      'REQUEST_BILL': 'HIGH',
      'CALL_STAFF': 'NORMAL',
      'REQUEST_WATER': 'NORMAL',
      'REQUEST_NAPKIN': 'LOW',
      'REQUEST_UTENSILS': 'LOW',
      'REQUEST_MENU': 'LOW',
      'COMPLAINT': 'HIGH',
      'OTHER': 'LOW',
    };
    return priorityMap[requestType] || 'NORMAL';
  }
}

module.exports = { CreateServiceRequestUseCase };