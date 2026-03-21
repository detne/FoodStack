/**
 * ORDER-110: GetOrderLifecycleUseCase
 * Xem lịch sử thay đổi trạng thái đơn
 */

class GetOrderLifecycleUseCase {
  constructor(orderRepository, activityLogRepository) {
    this.orderRepository = orderRepository;
    this.activityLogRepository = activityLogRepository;
  }

  async execute(orderId, auth) {
    // ✅ Acceptance 1: Order tồn tại
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }

    // Authorization check
    if (auth && auth.restaurantId && order.branches.restaurant_id !== auth.restaurantId) {
      const err = new Error('Forbidden: Access denied');
      err.status = 403;
      throw err;
    }

    // ✅ Acceptance 2-3: Trả danh sách event, bao gồm các trạng thái
    const activityLogs = await this.activityLogRepository.findByEntityId('ORDER', orderId);

    // Build timeline from activity logs and order data
    const timeline = [];

    // Add creation event
    timeline.push({
      event: 'created',
      status: 'PENDING',
      timestamp: order.created_at,
      user: null,
      description: 'Order was created',
      data: {
        order_number: order.order_number,
        table_number: order.tables?.table_number,
        total: order.total
      }
    });

    // Add status change events from activity logs
    activityLogs
      .filter(log => log.action === 'UPDATE_ORDER_STATUS' || log.action === 'CANCEL_ORDER')
      .forEach(log => {
        const newStatus = log.new_values?.status;
        const oldStatus = log.old_values?.status;
        
        let eventType = 'status_changed';
        let description = `Status changed from ${oldStatus} to ${newStatus}`;

        // Map to specific events
        switch (newStatus) {
          case 'PREPARING':
            eventType = 'preparing';
            description = 'Order is being prepared';
            break;
          case 'SERVED':
            eventType = 'served';
            description = 'Order has been served';
            break;
          case 'COMPLETED':
            eventType = 'completed';
            description = 'Order completed';
            break;
          case 'CANCELLED':
            eventType = 'cancelled';
            description = `Order cancelled: ${log.new_values?.cancellation_reason || 'No reason provided'}`;
            break;
        }

        timeline.push({
          event: eventType,
          status: newStatus,
          previous_status: oldStatus,
          timestamp: log.created_at,
          user: {
            id: log.user_id,
            // Note: You might want to join user data here
          },
          description,
          data: log.new_values
        });
      });

    // Sort timeline by timestamp
    timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return {
      order: {
        id: order.id,
        order_number: order.order_number,
        current_status: order.status,
        payment_status: order.payment_status,
        total: order.total,
        created_at: order.created_at,
        updated_at: order.updated_at
      },
      timeline,
      summary: {
        total_events: timeline.length,
        current_status: order.status,
        duration: this.calculateDuration(order.created_at, order.updated_at),
        status_history: timeline.map(event => ({
          status: event.status,
          timestamp: event.timestamp
        }))
      }
    };
  }

  calculateDuration(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      total_minutes: Math.floor(diffMs / (1000 * 60)),
      formatted: `${hours}h ${minutes}m`
    };
  }
}

module.exports = { GetOrderLifecycleUseCase };