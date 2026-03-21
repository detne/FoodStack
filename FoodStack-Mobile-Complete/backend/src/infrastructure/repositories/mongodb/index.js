/**
 * MongoDB Repositories Export
 */

const { OrderEventRepository } = require('./OrderEventRepository');
const { ServiceRequestRepository } = require('./ServiceRequestRepository');

module.exports = {
  OrderEventRepository,
  ServiceRequestRepository,
};
