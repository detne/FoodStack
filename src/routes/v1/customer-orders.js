/**
 * Customer Order Routes - Session-based Authentication
 * For mobile app order management
 */

const express = require('express');

/**
 * @route POST /api/v1/customer-orders/sessions
 * @desc Create order session for table
 * @access Public (but requires valid table QR)
 */
async function createOrderSession(req, res) {
  try {
    const { qr_token, customer_count = 1 } = req.body;

    // Validate table with relations
    const table = await req.prisma.tables.findUnique({
      where: { 
        qr_token: qr_token
      },
      include: {
        areas: {
          include: {
            branches: true
          }
        }
      }
    });

    if (!table || table.deleted_at !== null) {
      return res.status(404).json({
        success: false,
        message: 'Invalid QR code'
      });
    }

    // Check if there's already an active session for this table
    let session = await req.prisma.order_sessions.findFirst({
      where: {
        table_id: table.id,
        is_active: true
      },
      orderBy: {
        started_at: 'desc'
      }
    });

    // If no active session exists, create a new one
    if (!session) {
      // Only check AVAILABLE status when creating new session
      if (table.status !== 'AVAILABLE' && table.status !== 'OCCUPIED') {
        return res.status(400).json({
          success: false,
          message: 'Table is not available'
        });
      }

      session = await req.prisma.order_sessions.create({
        data: {
          table_id: table.id,
          session_token: require('crypto').randomBytes(32).toString('hex'),
          customer_count: parseInt(customer_count),
          started_at: new Date(),
          is_active: true
        }
      });

      // Update table status to OCCUPIED
      await req.prisma.tables.update({
        where: { id: table.id },
        data: { status: 'OCCUPIED' }
      });
    }

    // Get branch info
    const branch = table.areas.branches;

    res.json({
      success: true,
      data: {
        session_token: session.session_token,
        table: {
          id: table.id,
          name: table.table_number,
          capacity: table.capacity
        },
        branch: {
          id: branch.id,
          name: branch.name,
          restaurant_id: branch.restaurant_id
        }
      }
    });

  } catch (error) {
    console.error('Create order session error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
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
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired session'
      });
    }

    // Get table with branch info
    const table = await req.prisma.tables.findUnique({
      where: { id: session.table_id },
      include: {
        areas: {
          include: {
            branches: true
          }
        }
      }
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    const branch = table.areas.branches;

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
      
      // Add customization costs (if needed in future)
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
        price: menuItem.price,
        subtotal: itemTotal,
        notes: item.notes || null
      });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const order = await req.prisma.orders.create({
      data: {
        restaurant_id: branch.restaurant_id,
        branch_id: branch.id,
        table_id: table.id,
        session_id: session.id,
        order_number: orderNumber,
        status: 'PENDING',
        subtotal: subTotal,
        tax: 0,
        service_charge: 0,
        total: subTotal,
        payment_status: 'UNPAID',
        notes: notes || null
      }
    });

    // Create order items
    for (const item of orderItems) {
      await req.prisma.order_items.create({
        data: {
          order_id: order.id,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
          notes: item.notes
        }
      });
    }

    res.json({
      success: true,
      data: {
        order_id: order.id,
        order_number: order.order_number,
        status: order.status,
        total_amount: order.total,
        created_at: order.created_at
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
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

    const order = await req.prisma.orders.findFirst({
      where: { 
        id: order_id,
        session_id: session.id 
      },
      include: {
        order_items: {
          include: {
            menu_items: {
              select: {
                name: true,
                image_url: true
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
          subtotal: order.subtotal,
          total: order.total,
          notes: order.notes,
          created_at: order.created_at,
          items: order.order_items.map(item => ({
            id: item.id,
            name: item.menu_items.name,
            quantity: item.quantity,
            price: item.price,
            image_url: item.menu_items.image_url,
            notes: item.notes
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

    for (const item of items) {
      const menuItem = await req.prisma.menu_items.findUnique({
        where: { id: item.menu_item_id }
      });

      if (!menuItem) continue;

      let itemTotal = menuItem.price * item.quantity;
      additionalTotal += itemTotal;

      await req.prisma.order_items.create({
        data: {
          order_id: order.id,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          price: menuItem.price,
          subtotal: itemTotal,
          notes: item.notes || null
        }
      });
    }

    // Update order totals
    await req.prisma.orders.update({
      where: { id: order.id },
      data: {
        subtotal: order.subtotal + additionalTotal,
        total: order.total + additionalTotal
      }
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
  const router = express.Router();
  router.use(injectPrisma(prisma));
  
  router.post('/sessions', createOrderSession);
  router.post('/', createOrder);
  router.get('/table/:table_id', getTableOrders);
  router.get('/:order_id', getOrderStatus);
  router.put('/:order_id/items', addOrderItems);

  return router;
}

/**
 * @route GET /api/v1/customer-orders/table/:table_id
 * @desc Get all orders for a table
 * @access Public (with QR token validation)
 */
async function getTableOrders(req, res) {
  try {
    const { table_id } = req.params;
    const { qr_token } = req.query;

    // Validate QR token matches table
    const table = await req.prisma.tables.findFirst({
      where: {
        id: table_id,
        qr_token: qr_token,
        deleted_at: null
      },
      include: {
        areas: {
          select: {
            name: true
          }
        }
      }
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Invalid table or QR token'
      });
    }

    // Get active session for this table
    const session = await req.prisma.order_sessions.findFirst({
      where: {
        table_id: table_id,
        is_active: true
      },
      orderBy: {
        started_at: 'desc'
      }
    });

    if (!session) {
      return res.json({
        success: true,
        data: {
          table: {
            id: table.id,
            table_number: table.table_number,
            area_name: table.areas.name
          },
          orders: []
        }
      });
    }

    // Get orders for this session
    const orders = await req.prisma.orders.findMany({
      where: {
        session_id: session.id,
        status: { not: 'CANCELLED' }
      },
      include: {
        order_items: {
          include: {
            menu_items: {
              select: {
                name: true,
                description: true,
                image_url: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.json({
      success: true,
      data: {
        table: {
          id: table.id,
          table_number: table.table_number,
          area_name: table.areas.name
        },
        orders: orders.map(order => ({
          id: order.id,
          order_number: order.order_number || `#ORD-${order.id.slice(-4)}`,
          status: order.status,
          total: parseFloat(order.total),
          created_at: order.created_at,
          items: order.order_items.map(item => ({
            id: item.id,
            name: item.menu_items.name,
            description: item.menu_items.description,
            quantity: item.quantity,
            price: parseFloat(item.price),
            image_url: item.menu_items.image_url,
            notes: item.notes,
            customizations: ''
          }))
        }))
      }
    });

  } catch (error) {
    console.error('Get table orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

module.exports = { createCustomerOrderRoutes };