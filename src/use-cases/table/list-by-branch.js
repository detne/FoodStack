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

    console.log('Raw tables from DB:', JSON.stringify(tables.slice(0, 1), null, 2));

    // Transform data to match frontend expectations
    const transformed = tables.map(table => ({
      id: table.id,
      table_number: table.table_number,
      capacity: table.capacity,
      status: table.status.toLowerCase(),
      area_id: table.area_id,
      area_name: table.areas?.name || 'No Area',
      qr_token: table.qr_token,
      qr_code_url: table.qr_code_url,
    }));

    console.log('Transformed tables:', JSON.stringify(transformed.slice(0, 1), null, 2));

    return transformed;
  }
}

module.exports = { ListTablesByBranchUseCase };