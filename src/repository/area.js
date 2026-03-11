const { PrismaClient } = require('@prisma/client');

const { prisma } = require('../config/database.config');

class AreaRepository {
  constructor(prismaClient) {
    this.prisma = prismaClient || prisma;
  }

  async findByBranchAndName(branchId, name, tx) {
    const client = tx || this.prisma;
    return await client.areas.findFirst({
      where: {
        branch_id: branchId,
        deleted_at: null,
        name: { equals: name, mode: 'insensitive' },
      },
    });
  }

  async findById(areaId, tx) {
    const client = tx || this.prisma;
    return await client.areas.findUnique({
      where: { id: areaId },
    });
  }

  async findByBranchAndNameExcludeId(branchId, name, excludeAreaId, tx) {
    const client = tx || this.prisma;
    return await client.areas.findFirst({
      where: {
        branch_id: branchId,
        deleted_at: null,
        id: { not: excludeAreaId },
        name: { equals: name, mode: 'insensitive' },
      },
      select: { id: true },
    });
  }

  async create(data, tx) {
    const client = tx || this.prisma;
    return await client.areas.create({
      data,
    });
  }

  async update(areaId, data, tx) {
    const client = tx || this.prisma;
    return await client.areas.update({
      where: { id: areaId },
      data,
    });
  }

  async listByBranchId(branchId, tx) {
    const client = tx || this.prisma;
    return await client.areas.findMany({
      where: {
        branch_id: branchId,
        deleted_at: null,
      },
      orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
      select: {
        id: true,
        branch_id: true,
        name: true,
        sort_order: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async countActiveTables(areaId, tx) {
    const client = tx || this.prisma;
    return await client.tables.count({
      where: {
        area_id: areaId,
        deleted_at: null,
      },
    });
  }

  async deleteHard(areaId, tx) {
    const client = tx || this.prisma;
    return await client.areas.delete({
      where: { id: areaId },
    });
  }
}

module.exports = { AreaRepository };