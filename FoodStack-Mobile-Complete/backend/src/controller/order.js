/**
 * Order Controller
 * Handles HTTP requests for order management
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
    getOrderLifecycleUseCase
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
  }

  // ORDER-101: Create Order
  async createOrder(req, res, next) {
    try {
      const dto = CreateOrderSchema.parse(req.body);
      const result = await this.createOrderUseCase.execute(dto);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // ORDER-102: Get Order Details
  async getOrderDetails(req, res, next) {
    try {
      const { orderId } = req.params;
      const result = await this.getOrderDetailsUseCase.execute(orderId, req.user);

      res.status(200).json({
        success: true,
        message: 'Order details retrieved successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // ORDER-103: Update Order Status
  async updateOrderStatus(req, res, next) {
    try {
      const { orderId } = req.params;
      const dto = UpdateOrderStatusSchema.parse(req.body);
      
      const result = await this.updateOrderStatusUseCase.execute(
        orderId, 
        dto.status, 
        {
          ...req.user,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      );

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // ORDER-104: Add Items to Order
  async addItemsToOrder(req, res, next) {
    try {
      const { orderId } = req.params;
      const dto = AddItemsToOrderSchema.parse(req.body);
      
      const result = await this.addItemsToOrderUseCase.execute(orderId, dto.items, req.user);

      res.status(200).json({
        success: true,
        message: 'Items added to order successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // ORDER-105: Remove Item from Order
  async removeItemFromOrder(req, res, next) {
    try {
      const { orderId, orderItemId } = req.params;
      
      const result = await this.removeItemFromOrderUseCase.execute(orderId, orderItemId, req.user);

      res.status(200).json({
        success: true,
        message: 'Item removed from order successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // ORDER-106: Update Order Item
  async updateOrderItem(req, res, next) {
    try {
      const { orderId, orderItemId } = req.params;
      const dto = UpdateOrderItemSchema.parse(req.body);
      
      const result = await this.updateOrderItemUseCase.execute(
        orderId, 
        orderItemId, 
        dto.quantity, 
        req.user
      );

      res.status(200).json({
        success: true,
        message: 'Order item updated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // ORDER-107: Cancel Order
  async cancelOrder(req, res, next) {
    try {
      const { orderId } = req.params;
      const dto = CancelOrderSchema.parse(req.body);
      
      const result = await this.cancelOrderUseCase.execute(
        orderId, 
        dto.reason, 
        {
          ...req.user,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      );

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // ORDER-108: Get Active Orders by Branch
  async getActiveOrdersByBranch(req, res, next) {
    try {
      const { branchId } = req.params;
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        status: req.query.status,
        table_id: req.query.table_id
      };
      
      const result = await this.getActiveOrdersByBranchUseCase.execute(branchId, options, req.user);

      res.status(200).json({
        success: true,
        message: 'Active orders retrieved successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // ORDER-109: Get Orders by Table
  async getOrdersByTable(req, res, next) {
    try {
      const { tableId } = req.params;
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        status: req.query.status
      };
      
      const result = await this.getOrdersByTableUseCase.execute(tableId, options, req.user);

      res.status(200).json({
        success: true,
        message: 'Orders by table retrieved successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // ORDER-110: Get Order Lifecycle
  async getOrderLifecycle(req, res, next) {
    try {
      const { orderId } = req.params;
      
      const result = await this.getOrderLifecycleUseCase.execute(orderId, req.user);

      res.status(200).json({
        success: true,
        message: 'Order lifecycle retrieved successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { OrderController };