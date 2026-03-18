// src/use-cases/table/list-by-branch.js

class ListTablesByBranchUseCase {
  constructor(tableRepository, branchRepository, restaurantRepository, userRepository) {
    this.tableRepository = tableRepository;
    this.branchRepository = branchRepository;
    this.restaurantRepository = restaurantRepository;
    this.userRepository = userRepository;
  }

  async execute(branchId, context) {
    const role = (context?.role || '').toLowerCase();
    if (!role) {
      const err = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    // 1) Branch tồn tại
    const branch = await this.branchRepository.findById(branchId);
    if (!branch || branch.deleted_at) {
      const err = new Error('Branch not found');
      err.status = 404;
      throw err;
    }

    // 2) Check quyền theo restaurant chứa branch
    if (role === 'owner') {
      const restaurant = await this.restaurantRepository.findOwnerIdById(branch.restaurant_id);
      if (!restaurant || restaurant.owner_id !== context.userId) {
        const err = new Error('Forbidden: Not restaurant owner');
        err.status = 403;
        throw err;
      }
    } else {
      // staff/manager: phải thuộc restaurant của branch
      const user = await this.userRepository.findById(context.userId);
      if (!user?.restaurant_id || user.restaurant_id !== branch.restaurant_id) {
        const err = new Error('Forbidden: Not in this restaurant');
        err.status = 403;
        throw err;
      }
    }

    // 3) List tables by branch
    const tables = await this.tableRepository.listByBranchId(branchId);

    return tables;
  }
}

module.exports = { ListTablesByBranchUseCase };