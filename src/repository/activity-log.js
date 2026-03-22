const { PrismaClient } = require('@prisma/client');

class ActivityLogRepository {
  constructor(prisma) {
    this.prisma = prisma || new PrismaClient();
  }

  async create(logData) {
    return await this.prisma.activity_logs.create({
      data: {
        user_id: logData.user_id,
        restaurant_id: logData.restaurant_id,
        branch_id: logData.branch_id,
        action: logData.action,
        entity_type: logData.entity_type,
        entity_id: logData.entity_id,
        old_values: logData.old_values,
        new_values: logData.new_values,
        ip_address: logData.ip_address,
        user_agent: logData.user_agent,
        created_at: new Date()
      }
    });
  }

  async findByEntityId(entityType, entityId, options = {}) {
    const { limit = 50, offset = 0 } = options;

    return await this.prisma.activity_logs.findMany({
      where: {
        entity_type: entityType,
        entity_id: entityId
      },
      orderBy: {
        created_at: 'asc'
      },
      take: limit,
      skip: offset
    });
  }

  async findByUserId(userId, options = {}) {
    const { limit = 50, offset = 0, startDate, endDate } = options;
    
    const where = { user_id: userId };
    
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = startDate;
      if (endDate) where.created_at.lte = endDate;
    }

    return await this.prisma.activity_logs.findMany({
      where,
      orderBy: {
        created_at: 'desc'
      },
      take: limit,
      skip: offset
    });
  }

  async findByRestaurantId(restaurantId, options = {}) {
    const { limit = 50, offset = 0, action, entityType } = options;
    
    const where = { restaurant_id: restaurantId };
    
    if (action) where.action = action;
    if (entityType) where.entity_type = entityType;

    return await this.prisma.activity_logs.findMany({
      where,
      orderBy: {
        created_at: 'desc'
      },
      take: limit,
      skip: offset
    });
  }
}

module.exports = { ActivityLogRepository };