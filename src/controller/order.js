/**
 * Order Controller
 */

const { CreateOrderSchema } = require('../dto/order/create-order');
const { UpdateOrderStatusSchema } = require('../dto/order/update-order-status');
const { AddItemsToOrderSchema } = require('../dto/order/add-items-to-order');
const { UpdateOrderItemSchema } = require('../dto/order/update-order-item');
const { CancelOrderSchema } = require('../dto/order/cancel-order');

class OrderController {
  constructor(
    createOrderUseCase,
    getOrderDetailsUseCase,
    updateOrderStatusUseCase,
    addItemsToOrderUseCase,
    removeItemFromOrderUseCase,
    updateOrderItemUseCase,
    cancelOrderUseCase,
    getActiveOrdersByBranchUseCase,
    getOrdersByTableUseCase,
    getOrderLifecycleUseCase,
    updateRoundStatusUseCase,
    getCompletedOrdersByBranchUseCase,
    markItemServedUseCase
  ) {
    this.createOrderUseCase = createOrderUseCase;
    this.getOrderDetailsUseCase = getOrderDetailsUseCase;
    this.updateOrderStatusUseCase = updateOrderStatusUseCase;
    this.addItemsToOrderUseCase = addItemsToOrderUseCase;
    this.removeItemFromOrderUseCase = removeItemFromOrderUseCase;
    this.updateOrderItemUseCase = updateOrderItemUseCase;
    this.cancelOrderUseCase = cancelOrderUseCase;
    this.getActiveOrdersByBranchUseCase = getActiveOrdersByBranchUseCase;
    this.getOrdersByTableUseCase = getOrdersByTableUseCase;
    this.getOrderLifecycleUseCase = getOrderLifecycleUseCase;
    this.updateRoundStatusUseCase = updateRoundStatusUseCase;
    this.getCompletedOrdersByBranchUseCase = getCompletedOrdersByBranchUseCase;
    this.markItemServedUseCase = markItemServedUseCase;
  }

  async createOrder(req, res, next) {
    try {
      const dto = CreateOrderSchema.parse(req.body);
      const result = await this.createOrderUseCase.execute(dto);
      res.status(201).json({ success: true, message: 'Order created successfully', data: result });
    } catch (error) { next(error); }
  }

  async getOrderDetails(req, res, next) {
    try {
      const result = await this.getOrderDetailsUseCase.execute(req.params.orderId, req.user);
      res.status(200).json({ success: true, message: 'Order details retrieved', data: result });
    } catch (error) { next(error); }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const dto = UpdateOrderStatusSchema.parse(req.body);
      const result = await this.updateOrderStatusUseCase.execute(
        req.params.orderId, dto.status,
        { ...req.user, ipAddress: req.ip, userAgent: req.get('User-Agent') }
      );
      res.status(200).json({ success: true, message: 'Order status updated', data: result });
    } catch (error) { next(error); }
  }

  async addItemsToOrder(req, res, next) {
    try {
      const dto = AddItemsToOrderSchema.parse(req.body);
      const result = await this.addItemsToOrderUseCase.execute(req.params.orderId, dto.items, req.user);
      res.status(200).json({ success: true, message: 'Items added to order', data: result });
    } catch (error) { next(error); }
  }

  async removeItemFromOrder(req, res, next) {
    try {
      const result = await this.removeItemFromOrderUseCase.execute(
        req.params.orderId, req.params.orderItemId, req.user
      );
      res.status(200).json({ success: true, message: 'Item removed from order', data: result });
    } catch (error) { next(error); }
  }

  async updateOrderItem(req, res, next) {
    try {
      const dto = UpdateOrderItemSchema.parse(req.body);
      const result = await this.updateOrderItemUseCase.execute(
        req.params.orderId, req.params.orderItemId, dto.quantity, req.user
      );
      res.status(200).json({ success: true, message: 'Order item updated', data: result });
    } catch (error) { next(error); }
  }

  async cancelOrder(req, res, next) {
    try {
      const dto = CancelOrderSchema.parse(req.body);
      const result = await this.cancelOrderUseCase.execute(
        req.params.orderId, dto.reason,
        { ...req.user, ipAddress: req.ip, userAgent: req.get('User-Agent') }
      );
      res.status(200).json({ success: true, message: 'Order cancelled', data: result });
    } catch (error) { next(error); }
  }

  async getActiveOrdersByBranch(req, res, next) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        roundStatus: req.query.roundStatus,  // PENDING | PREPARING | SERVED | ALL
        table_id: req.query.table_id,
      };
      const result = await this.getActiveOrdersByBranchUseCase.execute(
        req.params.branchId, options, req.user
      );
      res.status(200).json({ success: true, message: 'Active orders retrieved', data: result });
    } catch (error) { next(error); }
  }

  async getOrdersByTable(req, res, next) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        status: req.query.status,
      };
      const result = await this.getOrdersByTableUseCase.execute(req.params.tableId, options, req.user);
      res.status(200).json({ success: true, message: 'Orders by table retrieved', data: result });
    } catch (error) { next(error); }
  }

  async getOrderLifecycle(req, res, next) {
    try {
      const result = await this.getOrderLifecycleUseCase.execute(req.params.orderId, req.user);
      res.status(200).json({ success: true, message: 'Order lifecycle retrieved', data: result });
    } catch (error) { next(error); }
  }

  // Update round status: PENDING → PREPARING → SERVED
  async updateRoundStatus(req, res, next) {
    try {
      const { orderId, roundId } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: 'status is required' });
      }
      const result = await this.updateRoundStatusUseCase.execute(
        orderId, roundId, status.toUpperCase(), req.user
      );
      res.status(200).json({ success: true, message: 'Round status updated', data: result });
    } catch (error) { next(error); }
  }

  async markItemServed(req, res, next) {
    try {
      const { orderId, roundId, itemId } = req.params;
      const result = await this.markItemServedUseCase.execute(orderId, roundId, itemId, req.user);
      res.status(200).json({ success: true, message: 'Item marked as served', data: result });
    } catch (error) { next(error); }
  }

  async getCompletedOrdersByBranch(req, res, next) {
    try {
      const options = {
        page: req.query.page,
        limit: req.query.limit,
      };
      const result = await this.getCompletedOrdersByBranchUseCase.execute(
        req.params.branchId, options, req.user
      );
      res.status(200).json({ success: true, message: 'Completed orders retrieved', data: result });
    } catch (error) { next(error); }
  }
}

module.exports = { OrderController };
