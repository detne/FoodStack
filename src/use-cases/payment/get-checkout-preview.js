class GetCheckoutPreviewUseCase {
  constructor(orderRepository, prisma) {
    this.orderRepository = orderRepository;
    this.prisma = prisma;
  }

  async validateOrderBelongsToQrTable(order, qrToken) {
    const table = await this.prisma.tables.findFirst({
      where: {
        qr_token: qrToken,
      },
      select: {
        id: true,
        qr_token: true,
        area_id: true,
      },
    });

    if (!table) {
      const err = new Error('Invalid QR token');
      err.status = 400;
      throw err;
    }

    if (!order.table_id) {
      const err = new Error('Order is not associated with a table');
      err.status = 400;
      throw err;
    }

    if (String(order.table_id) !== String(table.id)) {
      const err = new Error('Order does not belong to the scanned table');
      err.status = 403;
      throw err;
    }

    return table;
  }

  mapOrderItems(orderItems = []) {
    return orderItems.map((item) => ({
      id: item.id,
      menu_item_id: item.menu_item_id,
      name: item.menu_items?.name || null,
      description: item.menu_items?.description || null,
      image_url: item.menu_items?.image_url || null,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
      notes: item.notes || null,
    }));
  }

  async execute({ orderId, qrToken }) {
    const order = await this.orderRepository.findByIdWithDetails(orderId);

    if (!order) {
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }

    await this.validateOrderBelongsToQrTable(order, qrToken);

    return {
      order_id: order.id,
      order_number: order.order_number,
      branch_id: order.branch_id,
      table_id: order.table_id,
      table_number: order.tables?.table_number || null,
      area_id: order.tables?.areas?.id || null,
      area_name: order.tables?.areas?.name || null,
      status: order.status,
      payment_status: order.payment_status,
      customer_count: order.customer_count,
      items: this.mapOrderItems(order.order_items || []),
      subtotal: order.subtotal,
      tax: order.tax,
      service_charge: order.service_charge,
      total: order.total,
      created_at: order.created_at,
      updated_at: order.updated_at,
    };
  }
}

module.exports = { GetCheckoutPreviewUseCase };