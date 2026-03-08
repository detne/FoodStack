/**
 * Public API Routes - No Authentication Required
 * For mobile app QR scanning and menu access
 */

const express = require('express');
const router = express.Router();

/**
 * @route GET /api/v1/public/tables/:qr_token
 * @desc Get table info by QR token
 * @access Public
 */
async function getTableByQR(req, res) {
  try {
    const { qr_token } = req.params;
    
    // Get table with branch info
    const table = await req.prisma.tables.findUnique({
      where: { 
        qr_code_token: qr_token,
        deleted_at: null 
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            restaurant_id: true,
            restaurant: {
              select: {
                id: true,
                name: true,
                logo_url: true
              }
            }
          }
        },
        area: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Invalid QR code'
      });
    }

    if (table.status === 'OutOfService') {
      return res.status(400).json({
        success: false,
        message: 'Table is currently out of service'
      });
    }

    res.json({
      success: true,
      data: {
        table: {
          id: table.id,
          name: table.name,
          capacity: table.capacity,
          status: table.status,
          area: table.area
        },
        branch: table.branch,
        restaurant: table.branch.restaurant
      }
    });

  } catch (error) {
    console.error('Get table by QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

/**
 * @route GET /api/v1/public/branches/:branch_id/menu
 * @desc Get public menu for branch
 * @access Public
 */
async function getPublicMenu(req, res) {
  try {
    const { branch_id } = req.params;

    // Get categories with menu items
    const categories = await req.prisma.categories.findMany({
      where: {
        OR: [
          { branch_id: branch_id },
          { branch_id: null } // Global categories
        ],
        deleted_at: null
      },
      include: {
        menu_items: {
          where: {
            OR: [
              { branch_id: branch_id },
              { branch_id: null }
            ],
            deleted_at: null,
            is_available: true
          },
          select: {
            id: true,
            name: true,
            price: true,
            description: true,
            image_url: true,
            sort_order: true
          },
          orderBy: { sort_order: 'asc' }
        }
      },
      orderBy: { sort_order: 'asc' }
    });

    // Filter out empty categories
    const menuCategories = categories.filter(cat => cat.menu_items.length > 0);

    res.json({
      success: true,
      data: {
        categories: menuCategories
      }
    });

  } catch (error) {
    console.error('Get public menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

/**
 * @route GET /api/v1/public/menu-items/:item_id/customizations
 * @desc Get customization options for menu item
 * @access Public
 */
async function getItemCustomizations(req, res) {
  try {
    const { item_id } = req.params;

    const customizations = await req.prisma.item_customizations.findMany({
      where: { menu_item_id: item_id },
      include: {
        group: {
          include: {
            customization_options: {
              where: { deleted_at: null },
              orderBy: { sort_order: 'asc' }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        customizations: customizations.map(ic => ({
          group_id: ic.group.id,
          name: ic.group.name,
          min_select: ic.group.min_select,
          max_select: ic.group.max_select,
          is_required: ic.group.is_required,
          options: ic.group.customization_options
        }))
      }
    });

  } catch (error) {
    console.error('Get item customizations error:', error);
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

function createPublicRoutes(prisma) {
  router.use(injectPrisma(prisma));
  
  router.get('/tables/:qr_token', getTableByQR);
  router.get('/branches/:branch_id/menu', getPublicMenu);
  router.get('/menu-items/:item_id/customizations', getItemCustomizations);

  return router;
}

module.exports = { createPublicRoutes };