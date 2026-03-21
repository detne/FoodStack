/**
 * Table Repository
 * Data access layer for tables (PostgreSQL)
 */

const { prisma } = require('../../../config/database.config');
const { BaseRepository } = require('../BaseRepository');
const { NotFoundError, DatabaseError, ConflictError } = require('../../../core/errors');

class TableRepository extends BaseRepository {
  constructor() {
    super(prisma.table);
  }

  /**
   * Find table by QR code token
   * @param {string} qrCodeToken
   * @returns {Promise<Object|null>}
   */
  async findByQRToken(qrCodeToken) {
    try {
      return await prisma.table.findUnique({
        where: { qrCodeToken },
        include: {
          area: true,
          branch: {
            include: {
              restaurant: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError(error.message, 'findByQRToken');
    }
  }

  /**
   * Find tables by branch with area info
   * @param {string} branchId
   * @param {string} restaurantId
   * @returns {Promise<Object[]>}
   */
  async findByBranchWithArea(branchId, restaurantId) {
    try {
      return await prisma.table.findMany({
        where: {
          branchId,
          restaurantId,
          deletedAt: null,
        },
        include: {
          area: true,
        },
        orderBy: [
          { area: { sortOrder: 'asc' } },
          { name: 'asc' },
        ],
      });
    } catch (error) {
      throw new DatabaseError(error.message, 'findByBranchWithArea');
    }
  }

  /**
   * Find available tables by branch and capacity
   * @param {string} branchId
   * @param {number} minCapacity
   * @param {string} restaurantId
   * @returns {Promise<Object[]>}
   */
  async findAvailableByCapacity(branchId, minCapacity, restaurantId) {
    try {
      return await prisma.table.findMany({
        where: {
          branchId,
          restaurantId,
          status: 'Available',
          capacity: {
            gte: minCapacity,
          },
          deletedAt: null,
        },
        include: {
          area: true,
        },
        orderBy: {
          capacity: 'asc',
        },
      });
    } catch (error) {
      throw new DatabaseError(error.message, 'findAvailableByCapacity');
    }
  }

  /**
   * Update table status
   * @param {string} tableId
   * @param {string} status
   * @param {string} restaurantId
   * @returns {Promise<Object>}
   */
  async updateStatus(tableId, status, restaurantId) {
    try {
      const table = await prisma.table.findFirst({
        where: { id: tableId, restaurantId },
      });

      if (!table) {
        throw new NotFoundError('Table', tableId);
      }

      return await prisma.table.update({
        where: { id: tableId },
        data: { status },
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(error.message, 'updateStatus');
    }
  }

  /**
   * Create table with QR code generation
   * @param {Object} tableData
   * @param {string} restaurantId
   * @returns {Promise<Object>}
   */
  async createWithQR(tableData, restaurantId) {
    try {
      // Check if table name already exists in branch
      const existing = await prisma.table.findFirst({
        where: {
          branchId: tableData.branchId,
          name: tableData.name,
          deletedAt: null,
        },
      });

      if (existing) {
        throw new ConflictError(`Table '${tableData.name}' already exists in this branch`);
      }

      // Generate unique QR token
      const qrCodeToken = this._generateQRToken(restaurantId, tableData.branchId, tableData.name);

      return await prisma.table.create({
        data: {
          ...tableData,
          restaurantId,
          qrCodeToken,
        },
        include: {
          area: true,
        },
      });
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      throw new DatabaseError(error.message, 'createWithQR');
    }
  }

  /**
   * Get table statistics by branch
   * @param {string} branchId
   * @param {string} restaurantId
   * @returns {Promise<Object>}
   */
  async getStatisticsByBranch(branchId, restaurantId) {
    try {
      const [total, byStatus, byArea] = await Promise.all([
        // Total tables
        prisma.table.count({
          where: {
            branchId,
            restaurantId,
            deletedAt: null,
          },
        }),
        // Tables by status
        prisma.table.groupBy({
          by: ['status'],
          where: {
            branchId,
            restaurantId,
            deletedAt: null,
          },
          _count: true,
        }),
        // Tables by area
        prisma.table.groupBy({
          by: ['areaId'],
          where: {
            branchId,
            restaurantId,
            deletedAt: null,
          },
          _count: true,
        }),
      ]);

      return {
        total,
        byStatus: byStatus.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {}),
        byArea: byArea.length,
      };
    } catch (error) {
      throw new DatabaseError(error.message, 'getStatisticsByBranch');
    }
  }

  /**
   * Merge tables (for split bill feature)
   * @param {string} sourceTableId
   * @param {string} targetTableId
   * @param {string} userId
   * @param {string} restaurantId
   * @returns {Promise<Object>}
   */
  async mergeTables(sourceTableId, targetTableId, userId, restaurantId) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Verify both tables exist and belong to same restaurant
        const [sourceTable, targetTable] = await Promise.all([
          tx.table.findFirst({
            where: { id: sourceTableId, restaurantId },
          }),
          tx.table.findFirst({
            where: { id: targetTableId, restaurantId },
          }),
        ]);

        if (!sourceTable || !targetTable) {
          throw new NotFoundError('Table', !sourceTable ? sourceTableId : targetTableId);
        }

        // Record merge history
        await tx.tableMergeHistory.create({
          data: {
            sourceTableId,
            targetTableId,
            mergedBy: userId,
          },
        });

        // Move all active orders from source to target
        await tx.order.updateMany({
          where: {
            tableId: sourceTableId,
            status: {
              in: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Served'],
            },
          },
          data: {
            tableId: targetTableId,
          },
        });

        // Update source table status
        await tx.table.update({
          where: { id: sourceTableId },
          data: { status: 'Available' },
        });

        return { success: true, sourceTableId, targetTableId };
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(error.message, 'mergeTables');
    }
  }

  /**
   * Generate unique QR token
   * @private
   * @param {string} restaurantId
   * @param {string} branchId
   * @param {string} tableName
   * @returns {string}
   */
  _generateQRToken(restaurantId, branchId, tableName) {
    const crypto = require('crypto');
    const data = `${restaurantId}-${branchId}-${tableName}-${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
  }
}

module.exports = { TableRepository };
