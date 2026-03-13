// src/repository/service-request.js
class ServiceRequestRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async create(data) {
    const { v4: uuidv4 } = require('uuid');
    
    return this.prisma.notifications.create({
      data: {
        id: uuidv4(),
        restaurant_id: data.restaurantId,
        branch_id: data.branchId,
        type: 'SERVICE_REQUEST',
        title: this.getRequestTitle(data.requestType),
        message: data.message || this.getDefaultMessage(data.requestType),
        data: {
          tableId: data.tableId,
          requestType: data.requestType,
          priority: data.priority,
        },
        is_read: false,
        created_at: new Date(),
      },
    });
  }

  getRequestTitle(requestType) {
    const titles = {
      'CALL_STAFF': 'Yêu cầu hỗ trợ',
      'REQUEST_WATER': 'Yêu cầu nước uống',
      'REQUEST_NAPKIN': 'Yêu cầu khăn giấy',
      'REQUEST_UTENSILS': 'Yêu cầu đồ dùng',
      'REQUEST_BILL': 'Yêu cầu thanh toán',
      'REQUEST_MENU': 'Yêu cầu menu',
      'COMPLAINT': 'Khiếu nại',
      'OTHER': 'Yêu cầu khác',
    };
    return titles[requestType] || 'Yêu cầu dịch vụ';
  }

  getDefaultMessage(requestType) {
    const messages = {
      'CALL_STAFF': 'Khách hàng cần hỗ trợ từ nhân viên',
      'REQUEST_WATER': 'Khách hàng yêu cầu nước uống',
      'REQUEST_NAPKIN': 'Khách hàng yêu cầu khăn giấy',
      'REQUEST_UTENSILS': 'Khách hàng yêu cầu đồ dùng ăn',
      'REQUEST_BILL': 'Khách hàng yêu cầu thanh toán',
      'REQUEST_MENU': 'Khách hàng yêu cầu menu',
      'COMPLAINT': 'Khách hàng có khiếu nại',
      'OTHER': 'Khách hàng có yêu cầu khác',
    };
    return messages[requestType] || 'Yêu cầu dịch vụ từ khách hàng';
  }
}

module.exports = { ServiceRequestRepository };