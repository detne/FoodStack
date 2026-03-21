/**
 * Pagination DTO
 * Common pagination parameters
 */

const { z } = require('zod');

/**
 * Pagination Schema
 */
const PaginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * @typedef {Object} PaginationDto
 * @property {number} page
 * @property {number} limit
 * @property {string} [sortBy]
 * @property {'asc'|'desc'} sortOrder
 */

/**
 * Validate pagination parameters
 * @param {any} data
 * @returns {PaginationDto}
 */
function validatePagination(data) {
  return PaginationSchema.parse(data);
}

/**
 * Parse pagination from query string
 * @param {Object} query
 * @returns {PaginationDto}
 */
function parsePaginationQuery(query) {
  return PaginationSchema.parse({
    page: query.page ? parseInt(query.page, 10) : 1,
    limit: query.limit ? parseInt(query.limit, 10) : 20,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder || 'desc',
  });
}

module.exports = {
  PaginationSchema,
  validatePagination,
  parsePaginationQuery,
};
