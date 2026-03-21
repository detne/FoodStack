/**
 * Payment Repository
 * Data access layer for payments with transaction safety (PostgreSQL)
 * CRITICAL: All payment operations must be ACID-safe
 */

const { prisma } = require('../../../config/database.config');
const { BaseRepository } = require('../BaseRepository');
const { NotFoundError, DatabaseError, PaymentAlreadyProcessedError } = require('../../../core/errors');

class PaymentRepository extends BaseRepository {
  constructor() {
    super(prisma.payment);
  }

  /**
   * Process payment with transaction safety (SELECT FOR UPDATE)
   * CRITICAL: Prevents double payment
   * @param {Object} paymentData
   * @param {string} orderId
   * @param {string} restaurantId
   * @returns {Promise<Object>}
   */
  async processPaymentWithLock(paymentData, orderId, restaurantId) {
    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Lock the order row (SELECT FOR UPDATE)
        const order = await tx.$queryRaw`
          SELECT * FROM orders 
          WHERE id = ${orderId}::uuid 
          AND restaurant_id = ${restaurantId}::uuid
          FOR UPDATE
        `;

        if (!order || order.length === 0) {
          throw new NotFoundError('Order', orderId);
        }

        const lockedOrder = order[0];

        // 2. Check if payment already processed
        if (lockedOrder.payment_status === 'Success') {
          throw new PaymentAlreadyProcessedError(orderId);
        }

        // 3. Check if payment already exists
        const existingPayment = await tx.payment.findUnique({
          where: { orderId },
        });

        if (existingPayment && existingPayment.status === 'Success') {
          throw new PaymentAlreadyProcessedError(orderId);
        }

        // 4. Create or update payment
        const payment = existingPayment
          ? await tx.payment.update({
              where: { orderId },
              data: {
                amount: paymentData.amount,
                method: paymentData.method,
                status: paymentData.status,
                transactionRef: paymentData.transactionRef,
                payosData: paymentData.payosData,
              },
            })
          : await tx.payment.create({
              data: {
                orderId,
                amount: paymentData.amount,
                method: paymentData.method,
                status: paymentData.status,
                transactionRef: paymentData.transactionRef,
                payosData: paymentData.payosData,
              },
            });

        // 5. Update order payment status
        await tx.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: paymentData.status,
            status: paymentData.status === 'Success' ? 'Completed' : lockedOrder.status,
            closedAt: paymentData.status === 'Success' ? new Date() : null,
          },
        });

        // 6. If payment successful, update table status to Available
        if (paymentData.status === 'Success') {
          await tx.table.update({
            where: { id: lockedOrder.table_id },
            data: { status: 'Available' },
          });

          // 7. Close order session
          if (lockedOrder.session_id) {
            await tx.orderSession.updateMany({
              where: {
                id: lockedOrder.session_id,
                isActive: true,
              },
              data: {
                endedAt: new Date(),
                isActive: false,
              },
            });
          }
        }

        return payment;
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof PaymentAlreadyProcessedError) {
        throw error;
      }
      throw new DatabaseError(error.message, 'processPaymentWithLock');
    }
  }

  /**
   * Find payment by order ID
   * @param {string} orderId
   * @param {string} restaurantId
   * @returns {Promise<Object|null>}
   */
  async findByOrderId(orderId, restaurantId) {
    try {
      return await prisma.payment.findFirst({
        where: {
          orderId,
          order: {
            restaurantId,
          },
        },
        include: {
          order: {
            include: {
              table: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError(error.message, 'findByOrderId');
    }
  }

  /**
   * Find payment by transaction reference (for webhook verification)
   * @param {string} transactionRef
   * @returns {Promise<Object|null>}
   */
  async findByTransactionRef(transactionRef) {
    try {
      return await prisma.payment.findFirst({
        where: { transactionRef },
        include: {
          order: {
            include: {
              restaurant: true,
              table: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError(error.message, 'findByTransactionRef');
    }
  }

  /**
   * Check if payment exists with idempotency key
   * @param {string} idempotencyKey
   * @returns {Promise<Object|null>}
   */
  async findByIdempotencyKey(idempotencyKey) {
    try {
      return await prisma.payment.findFirst({
        where: {
          payosData: {
            path: ['idempotencyKey'],
            equals: idempotencyKey,
          },
        },
      });
    } catch (error) {
      throw new DatabaseError(error.message, 'findByIdempotencyKey');
    }
  }

  /**
   * Refund payment with transaction
   * @param {string} paymentId
   * @param {number} refundAmount
   * @param {string} reason
   * @param {string} restaurantId
   * @returns {Promise<Object>}
   */
  async refundPayment(paymentId, refundAmount, reason, restaurantId) {
    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Get payment with lock
        const payment = await tx.payment.findFirst({
          where: {
            id: paymentId,
            order: {
              restaurantId,
            },
          },
          include: {
            order: true,
          },
        });

        if (!payment) {
          throw new NotFoundError('Payment', paymentId);
        }

        if (payment.status !== 'Success') {
          throw new DatabaseError('Cannot refund non-successful payment', 'refundPayment');
        }

        // 2. Update payment status
        const refundStatus = refundAmount >= payment.amount ? 'Refunded' : 'PartialRefund';
        
        const updatedPayment = await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: refundStatus,
            payosData: {
              ...payment.payosData,
              refund: {
                amount: refundAmount,
                reason,
                refundedAt: new Date().toISOString(),
              },
            },
          },
        });

        // 3. Update order status
        await tx.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: refundStatus,
            status: 'Cancelled',
          },
        });

        return updatedPayment;
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(error.message, 'refundPayment');
    }
  }

  /**
   * Get payment statistics by date range
   * @param {string} restaurantId
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Object>}
   */
  async getStatistics(restaurantId, startDate, endDate) {
    try {
      const [totalPayments, successfulPayments, totalRevenue, paymentMethods] = await Promise.all([
        // Total payments
        prisma.payment.count({
          where: {
            order: { restaurantId },
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
        // Successful payments
        prisma.payment.count({
          where: {
            order: { restaurantId },
            status: 'Success',
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
        // Total revenue
        prisma.payment.aggregate({
          where: {
            order: { restaurantId },
            status: 'Success',
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          _sum: {
            amount: true,
          },
        }),
        // Payment methods breakdown
        prisma.payment.groupBy({
          by: ['method'],
          where: {
            order: { restaurantId },
            status: 'Success',
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          _count: true,
          _sum: {
            amount: true,
          },
        }),
      ]);

      return {
        totalPayments,
        successfulPayments,
        failedPayments: totalPayments - successfulPayments,
        successRate: totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0,
        totalRevenue: totalRevenue._sum.amount || 0,
        paymentMethods: paymentMethods.map((pm) => ({
          method: pm.method,
          count: pm._count,
          amount: pm._sum.amount || 0,
        })),
      };
    } catch (error) {
      throw new DatabaseError(error.message, 'getStatistics');
    }
  }
}

module.exports = { PaymentRepository };
