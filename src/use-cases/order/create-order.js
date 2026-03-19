/**
 * ORDER-101: CreateOrderUseCase
 * Tạo đơn hàng mới khi khách quét QR tại bàn
 */

const { v4: uuidv4 } = require('uuid');

class CreateOrderUseCase {
  constructor(orderRepository, tableRepository, branchRepository, menuItemRepository) {
    this.orderRepository = orderRepository;
    this.tableRepository = tableRepository;
    this.branchRepository = branchRepository;
    this.menuItemRepository = menuItemRepository;
  }

  async execute(dto) {
    const { qr_token, items = [], customer_count = 1 } = dto;

    // ✅ Acceptance 1: QR hợp lệ
    const table = await this.tableRepository.findByQrToken(qr_token);
    if (!table) {
      const err = new Error('Invalid QR code');
      err.status = 400;
      throw err;
    }

    // ✅ Acceptance 2: Table tồn tại
    if (table.deleted_at) {
      const err = new Error('Table not found');
      err.status = 404;
      throw err;
    }

    // ✅ Acceptance 3: Branch đang mở
    const branch = await this.branchRepository.findById(table.areas.branch_id);
    if (!branch || branch.status !== 'ACTIVE') {
      const err = new Error('Branch is not active');
      err.status = 400;
      throw err;
    }

    // Validate menu items if provided
    let orderItems = [];
    let subtotal = 0;

    if (items && items.length > 0) {
      for (const item of items) {
        const menuItem = await this.menuItemRepository.findById(item.menu_item_id);
        if (!menuItem || !menuItem.available) {
          const err = new Error(`Menu item ${item.menu_item_id} not available`);
          err.status = 400;
          throw err;
        }

        const itemSubtotal = menuItem.price * item.quantity;
        subtotal += itemSubtotal;

        orderItems.push({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          price: menuItem.price,
          subtotal: itemSubtotal,
          notes: item.notes || null,
          customizations: item.customizations || []
        });
      }
    }

    // Calculate totals
    const tax = subtotal * 0.1; // 10% tax
    const service_charge = subtotal * 0.05; // 5% service charge
    const total = subtotal + tax + service_charge;

    // Generate order number
    const orderNumber = await this.generateOrderNumber(branch.id);

    // ✅ Acceptance 4-7: Tạo order với status = PENDING, gắn với tableId, lưu order items, tính tổng tiền
    const order = await this.orderRepository.createWithItems({
      branch_id: branch.id,
      table_id: table.id,
      order_number: orderNumber,
      status: 'PENDING',
      subtotal,
      tax,
      service_charge,
      total,
      payment_status: 'UNPAID',
      customer_count,
      items: orderItems
    });

    // Update table status to occupied
    await this.tableRepository.updateStatus(table.id, 'OCCUPIED');

    return {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      subtotal: order.subtotal,
      tax: order.tax,
      service_charge: order.service_charge,
      total: order.total,
      payment_status: order.payment_status,
      table: {
        id: table.id,
        table_number: table.table_number,
        area_name: table.areas.name
      },
      branch: {
        id: branch.id,
        name: branch.name
      },
      items: order.order_items || [],
      created_at: order.created_at
    };
  }

  async generateOrderNumber(branchId) {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    const count = await this.orderRepository.countOrdersToday(branchId);
    const orderNum = String(count + 1).padStart(3, '0');
    
    return `ORD-${dateStr}-${orderNum}`;
  }
}

module.exports = { CreateOrderUseCase };