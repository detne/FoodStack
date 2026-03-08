/**
 * Customer Order Routes - Session-based Authentication
 * For mobile app order management
 */

const express = require('express');
const router = express.Router();

/**
 * @route POST /api/v1/customer-orders/sessions
 * @desc Create order session for table
 * @access Public (but requires valid table QR)
 */
async function createOrderSession(req, res) {
  try {
    const { qr_token, customer_count = 1 } = req.body;

    // Validate table
    const table = await req.prisma.tables.findUnique({
      where: { 
        qr_code_token: qr_token,
        deleted_at: null 
      },
      include: {
        branch: true
      }
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Invalid QR code'
      });
    }

    if (table.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: 'Table is not available'
      });
    }

    // Create session
    const session = await req.prisma.order_sessions.create({
      data: {
        table_id: table.id,
        session_token: require('crypto').randomBytes(32).toString('hex'),
        customer_count: parseInt(customer_count),
        started_at: new Date(),
        is_active: true
      }
    });

    // Update table status
    await req.prisma.tables.update({
      where: { id: table.id },
      data: { status: 'Occupied' }
    });

    res.json({
      success: true,
      data: {
        session_token: session.session_token,
        table: {
          id: table.id,
          name: table.name,
          capacity: table.capacity
        },
        branch: {
          id: table.branch.id,
          name: table.branch.name,
          restaurant_id: table.branch.restaurant_id
        }
      }
    });

  } catch (error) {
    console.error('Create order session error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

/**
 * @route POST /api/v1/customer-orders
 * @desc Create new order
 * @access Session-based
 */
async function createOrder(req, res) {
  try {
    const { session_token, items, notes } = req.body;

    // Validate session
    const session = await req.prisma.order_sessions.findUnique({
      where: { 
        session_token,
        is_active: true 
      },
      include: {
        table: {
          include: {
            branch: true
          }
        }
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired session'
      });
    }

    // Calculate totals
    let subTotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await req.prisma.menu_items.findUnique({
        where: { id: item.menu_item_id }
      });

      if (!menuItem) {
        return res.status(400).json({
          success: false,
          message: `Menu item ${item.menu_item_id} not found`
        });
      }

      let itemTotal = menuItem.price * item.quantity;
      
      // Add customization costs
      if (item.customizations) {
        for (const customization of item.customizations) {
          const option = await req.prisma.customization_options.findUnique({
            where: { id: customization.option_id }
          });
          if (option) {
            itemTotal += option.price_delta * item.quantity;
          }
        }
      }

      subTotal += itemTotal;
      orderItems.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        base_price: menuItem.price,
        notes: item.notes || null,
        customizations: item.customizations || []
      });
    }

    // Create order
    const order = await req.prisma.$transaction(async (tx) => {
      const newOrder = await tx.orders.create({
        data: {
          restaurant_id: session.table.branch.restaurant_id,
          branch_id: session.table.branch_id,
          table_id: session.table_id,
          session_id: session.id,
          status: 'Pending',
          sub_total: subTotal,
          total_amount: subTotal,
          payment_status: 'Pending',
          notes
        }
      });

      // Create order items
      for (const item of orderItems) {
        const orderItem = await tx.order_items.create({
          data: {
            order_id: newOrder.id,
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            base_price: item.base_price,
            notes: item.notes,
            session_id: session_token
          }
        });

        // Create customizations
        if (item.customizations) {
          for (const customization of item.customizations) {
            const option = await tx.customization_options.findUnique({
              where: { id: customization.option_id }
            });
            
            await tx.order_item_customizations.create({
              data: {
                order_item_id: orderItem.id,
                option_id: customization.option_id,
                price_delta: option?.price_delta || 0
              }
            });
          }
        }
      }

      return newOrder;
    });

    res.json({
      success: true,
      data: {
        order_id: order.id,
        status: order.status,
        total_amount: order.total_amount,
        created_at: order.created_at
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

/**
 * @route GET /api/v1/customer-orders/:order_id
 * @desc Get order details and status
 * @access Session-based
 */
async function getOrderStatus(req, res) {
  try {
    const { order_id } = req.params;
    const { session_token } = req.query;

    // Validate session
    const session = await req.prisma.order_sessions.findUnique({
      where: { session_token }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Invalid session'
      });
    }

    const order = await req.prisma.orders.findUnique({
      where: { 
        id: order_id,
        session_id: session.id 
      },
      include: {
        order_items: {
          include: {
            menu_item: {
              select: {
                name: true,
                image_url: true
              }
            },
            order_item_customizations: {
              include: {
                option: {
                  select: {
                    name: true,
                    price_delta: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: {
        order: {
          id: order.id,
          status: order.status,
          payment_status: order.payment_status,
          sub_total: order.sub_total,
          total_amount: order.total_amount,
          notes: order.notes,
          created_at: order.created_at,
          items: order.order_items.map(item => ({
            id: item.id,
            name: item.menu_item.name,
            quantity: item.quantity,
            base_price: item.base_price,
            image_url: item.menu_item.image_url,
            notes: item.notes,
            customizations: item.order_item_customizations.map(c => ({
              name: c.option.name,
              price_delta: c.price_delta
            }))
          }))
        }
      }
    });

  } catch (error) {
    console.error('Get order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

/**
 * @route PUT /api/v1/customer-orders/:order_id/items
 * @desc Add items to existing order
 * @access Session-based
 */
async function addOrderItems(req, res) {
  try {
    const { order_id } = req.params;
    const { session_token, items } = req.body;

    // Validate session and order
    const session = await req.prisma.order_sessions.findUnique({
      where: { session_token }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Invalid session'
      });
    }

    const order = await req.prisma.orders.findUnique({
      where: { 
        id: order_id,
        session_id: session.id,
        status: { in: ['Pending', 'Preparing'] }
      }
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'Order not found or cannot be modified'
      });
    }

    // Add new items
    let additionalTotal = 0;

    await req.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const menuItem = await tx.menu_items.findUnique({
          where: { id: item.menu_item_id }
        });

        if (!menuItem) continue;

        let itemTotal = menuItem.price * item.quantity;
        additionalTotal += itemTotal;

        const orderItem = await tx.order_items.create({
          data: {
            order_id: order.id,
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            base_price: menuItem.price,
            notes: item.notes || null,
            session_id: session_token
          }
        });

        // Add customizations
        if (item.customizations) {
          for (const customization of item.customizations) {
            const option = await tx.customization_options.findUnique({
              where: { id: customization.option_id }
            });
            
            if (option) {
              additionalTotal += option.price_delta * item.quantity;
              
              await tx.order_item_customizations.create({
                data: {
                  order_item_id: orderItem.id,
                  option_id: customization.option_id,
                  price_delta: option.price_delta
                }
              });
            }
          }
        }
      }

      // Update order totals
      await tx.orders.update({
        where: { id: order.id },
        data: {
          sub_total: order.sub_total + additionalTotal,
          total_amount: order.total_amount + additionalTotal
        }
      });
    });

    res.json({
      success: true,
      message: 'Items added successfully',
      data: {
        additional_amount: additionalTotal
      }
    });

  } catch (error) {
    console.error('Add order items error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Middleware to inject Prisma
function injectPrisma(prisma) {
  return (req, res, next) => {
    req.prisma = prisma;
    next();
  };
}

function createCustomerOrderRoutes(prisma) {
  router.use(injectPrisma(prisma));
  
  router.post('/sessions', createOrderSession);
  router.post('/', createOrder);
  router.get('/:order_id', getOrderStatus);
  router.put('/:order_id/items', addOrderItems);

  return router;
}

module.exports = { createCustomerOrderRoutes };