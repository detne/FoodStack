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
    
    // Get table info using raw query to avoid relation issues
    const result = await req.prisma.$queryRaw`
      SELECT 
        t.id as table_id,
        t.table_number,
        t.capacity,
        t.status,
        a.id as area_id,
        a.name as area_name,
        b.id as branch_id,
        b.name as branch_name,
        b.restaurant_id,
        r.id as restaurant_id,
        r.name as restaurant_name,
        r.logo_url
      FROM tables t
      JOIN areas a ON t.area_id = a.id
      JOIN branches b ON a.branch_id = b.id
      JOIN restaurants r ON b.restaurant_id = r.id
      WHERE t.qr_token = ${qr_token}
        AND t.deleted_at IS NULL
    `;

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invalid QR code'
      });
    }

    const tableData = result[0];

    if (tableData.status === 'OutOfService') {
      return res.status(400).json({
        success: false,
        message: 'Table is currently out of service'
      });
    }

    res.json({
      success: true,
      data: {
        table: {
          id: tableData.table_id,
          name: tableData.table_number,
          capacity: tableData.capacity,
          status: tableData.status,
          area: {
            id: tableData.area_id,
            name: tableData.area_name
          }
        },
        branch: {
          id: tableData.branch_id,
          name: tableData.branch_name,
          restaurant_id: tableData.restaurant_id
        },
        restaurant: {
          id: tableData.restaurant_id,
          name: tableData.restaurant_name,
          logo_url: tableData.logo_url
        }
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
        branch_id: branch_id,
        deleted_at: null
      },
      include: {
        menu_items: {
          where: {
            deleted_at: null,
            available: true
          },
          select: {
            id: true,
            name: true,
            price: true,
            description: true,
            image_url: true
          },
          orderBy: { id: 'asc' }
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

    // Simple response for now - will implement customizations later
    res.json({
      success: true,
      data: {
        customizations: []
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