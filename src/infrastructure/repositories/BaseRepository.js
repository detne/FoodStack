/**
 * Base Repository
 * Abstract base class for all repositories with common CRUD operations
 */

const { NotFoundError } = require('../../core/errors');

/**
 * @template T
 */
class BaseRepository {
  /**
   * @param {Object} model - Prisma model or Mongoose model
   */
  constructor(model) {
    this.model = model;
  }

  /**
   * Find entity by ID
   * @param {string} id
   * @param {string} [tenantId]
   * @returns {Promise<T|null>}
   */
  async findById(id, tenantId = undefined) {
    const where = { id };
    if (tenantId) {
      where.restaurantId = tenantId;
    }

    return this.model.findUnique({ where });
  }

  /**
   * Find all entities with optional filters
   * @param {Object} [filters={}]
   * @param {string} [tenantId]
   * @returns {Promise<T[]>}
   */
  async findAll(filters = {}, tenantId = undefined) {
    const where = { ...filters };
    if (tenantId) {
      where.restaurantId = tenantId;
    }

    return this.model.findMany({ where });
  }

  /**
   * Find entities with pagination
   * @param {Object} pagination
   * @param {number} pagination.page
   * @param {number} pagination.limit
   * @param {string} [pagination.sortBy]
   * @param {'asc'|'desc'} [pagination.sortOrder]
   * @param {Object} [filters={}]
   * @param {string} [tenantId]
   * @returns {Promise<{data: T[], pagination: Object}>}
   */
  async findPaginated(pagination, filters = {}, tenantId = undefined) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    
    const where = { ...filters };
    if (tenantId) {
      where.restaurantId = tenantId;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.model.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Find one entity by filters
   * @param {Object} filters
   * @param {string} [tenantId]
   * @returns {Promise<T|null>}
   */
  async findOne(filters, tenantId = undefined) {
    const where = { ...filters };
    if (tenantId) {
      where.restaurantId = tenantId;
    }

    return this.model.findFirst({ where });
  }

  /**
   * Create new entity
   * @param {Partial<T>} data
   * @param {string} [tenantId]
   * @returns {Promise<T>}
   */
  async create(data, tenantId = undefined) {
    const createData = { ...data };
    if (tenantId) {
      createData.restaurantId = tenantId;
    }

    return this.model.create({ data: createData });
  }

  /**
   * Update entity by ID
   * @param {string} id
   * @param {Partial<T>} data
   * @param {string} [tenantId]
   * @returns {Promise<T>}
   */
  async update(id, data, tenantId = undefined) {
    const where = { id };
    if (tenantId) {
      where.restaurantId = tenantId;
    }

    // Check if entity exists
    const exists = await this.model.findUnique({ where });
    if (!exists) {
      throw new NotFoundError('Entity', id);
    }

    return this.model.update({
      where,
      data,
    });
  }

  /**
   * Delete entity by ID (soft delete)
   * @param {string} id
   * @param {string} [tenantId]
   * @returns {Promise<boolean>}
   */
  async delete(id, tenantId = undefined) {
    const where = { id };
    if (tenantId) {
      where.restaurantId = tenantId;
    }

    // Check if entity exists
    const exists = await this.model.findUnique({ where });
    if (!exists) {
      throw new NotFoundError('Entity', id);
    }

    await this.model.update({
      where,
      data: { deletedAt: new Date() },
    });

    return true;
  }

  /**
   * Hard delete entity by ID
   * @param {string} id
   * @param {string} [tenantId]
   * @returns {Promise<boolean>}
   */
  async hardDelete(id, tenantId = undefined) {
    const where = { id };
    if (tenantId) {
      where.restaurantId = tenantId;
    }

    await this.model.delete({ where });
    return true;
  }

  /**
   * Count entities
   * @param {Object} [filters={}]
   * @param {string} [tenantId]
   * @returns {Promise<number>}
   */
  async count(filters = {}, tenantId = undefined) {
    const where = { ...filters };
    if (tenantId) {
      where.restaurantId = tenantId;
    }

    return this.model.count({ where });
  }

  /**
   * Check if entity exists
   * @param {string} id
   * @param {string} [tenantId]
   * @returns {Promise<boolean>}
   */
  async exists(id, tenantId = undefined) {
    const where = { id };
    if (tenantId) {
      where.restaurantId = tenantId;
    }

    const entity = await this.model.findUnique({ where });
    return entity !== null;
  }
}

module.exports = { BaseRepository };
