class DeleteBranchUseCase {
  constructor(branchRepository) {
    this.branchRepository = branchRepository;
  }

  async execute(branchId, auth) {
    // must login
    if (!auth?.userId) {
      const err = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    // ✅ only owner
    if (auth.role !== 'OWNER') {
      const err = new Error('Forbidden: Owner only');
      err.status = 403;
      throw err;
    }

    // ✅ branch exists
    const branch = await this.branchRepository.findById(branchId);
    if (!branch) {
      const err = new Error('Branch not found');
      err.status = 404;
      throw err;
    }

    // ✅ owner đúng restaurant
    // If restaurantId not in token (old token), verify via restaurant ownership
    if (auth.restaurantId) {
      // New token with restaurantId
      if (String(auth.restaurantId) !== String(branch.restaurant_id)) {
        const err = new Error('Forbidden: Not your restaurant');
        err.status = 403;
        throw err;
      }
    } else {
      // Old token without restaurantId - verify via restaurant.owner_id
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const restaurant = await prisma.restaurants.findUnique({
        where: { id: branch.restaurant_id },
        select: { owner_id: true }
      });

      if (!restaurant || String(restaurant.owner_id) !== String(auth.userId)) {
        const err = new Error('Forbidden: Not your restaurant');
        err.status = 403;
        throw err;
      }
      
      await prisma.$disconnect();
    }

    // ✅ Check if already inactive (soft deleted)
    if (branch.deleted_at) {
      // Already soft deleted → Hard delete permanently
      await this.branchRepository.delete(branchId);
      return { 
        message: 'Branch permanently deleted',
        permanent: true 
      };
    } else {
      // Active branch → Soft delete (mark as inactive)
      await this.branchRepository.deactivate(branchId);
      return { 
        message: 'Branch deactivated. Click delete again to permanently remove.',
        permanent: false 
      };
    }
  }
}

module.exports = { DeleteBranchUseCase };