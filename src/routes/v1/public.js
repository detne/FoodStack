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
    
    // Get table info with relations
    const table = await req.prisma.tables.findUnique({
      where: { 
        qr_token: qr_token
      },
      include: {
        areas: {
          include: {
            branches: {
              include: {
                restaurants: true
              }
            }
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
          name: table.table_number,
          capacity: table.capacity,
          status: table.status,
          area: {
            id: table.areas.id,
            name: table.areas.name
          }
        },
        branch: {
          id: table.areas.branches.id,
          name: table.areas.branches.name,
          restaurant_id: table.areas.branches.restaurant_id
        },
        restaurant: {
          id: table.areas.branches.restaurants.id,
          name: table.areas.branches.restaurants.name,
          logo_url: table.areas.branches.restaurants.logo_url
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
 * @desc Get public menu for branch (menu is restaurant-level, filtered by branch availability)
 * @access Public
 */
async function getPublicMenu(req, res) {
  try {
    const { branch_id } = req.params;

    // Get branch to find restaurant
    const branch = await req.prisma.branches.findUnique({
      where: { id: branch_id },
      select: { 
        restaurant_id: true,
        name: true
      }
    });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    // Get categories with menu items for this restaurant
    const categories = await req.prisma.categories.findMany({
      where: {
        restaurant_id: branch.restaurant_id
      },
      include: {
        menu_items: {
          where: {
            available: true
          },
          select: {
            id: true,
            name: true,
            price: true,
            description: true,
            image_url: true,
            menu_item_availability: {
              where: {
                branch_id: branch_id
              },
              select: {
                is_available: true
              }
            }
          },
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { sort_order: 'asc' }
    });

    // Filter menu items based on branch availability
    const menuCategories = categories.map(category => {
      const availableItems = category.menu_items.filter(item => {
        // If no availability record exists, show the item (default available)
        if (!item.menu_item_availability || item.menu_item_availability.length === 0) {
          return true;
        }
        // If availability record exists, check is_available flag
        return item.menu_item_availability[0].is_available;
      }).map(item => {
        // Remove the availability field from response
        const { menu_item_availability, ...itemData } = item;
        return itemData;
      });

      return {
        ...category,
        menu_items: availableItems
      };
    }).filter(cat => cat.menu_items.length > 0); // Filter out empty categories

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