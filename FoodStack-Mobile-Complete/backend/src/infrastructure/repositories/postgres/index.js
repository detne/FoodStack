/**
 * PostgreSQL Repositories Export
 */

const { OrderRepository } = require('./OrderRepository');
const { PaymentRepository } = require('./PaymentRepository');
const { TableRepository } = require('./TableRepository');
const { MenuRepository } = require('./MenuRepository');

module.exports = {
  OrderRepository,
  PaymentRepository,
  TableRepository,
  MenuRepository,
};
