const { v4: uuidv4 } = require('uuid');

class CreateAreaUseCase {
  constructor(areaRepository, branchRepository, restaurantRepository, userRepository, prisma) {
    this.areaRepository = areaRepository;
    this.branchRepository = branchRepository;
    this.restaurantRepository = restaurantRepository;
    this.userRepository = userRepository;
    this.prisma = prisma; // để transaction
  }

  async execute(branchId, dto, context) {
    const role = (context?.role || '').toLowerCase();
    if (role !== 'owner' && role !== 'manager') {
      const err = new Error('Forbidden: Owner/Manager only');
      err.status = 403;
      throw err;
    }

    const name = dto.name.trim();
    if (!name) {
      const err = new Error('Invalid area name');
      err.status = 400;
      throw err;
    }

    return await this.prisma.$transaction(async (tx) => {
      // 1) Branch tồn tại
      const branch = await this.branchRepository.findById(branchId);
      if (!branch || branch.deleted_at) {
        const err = new Error('Branch not found');
        err.status = 404;
        throw err;
      }

      // 2) Check quyền theo restaurant chứa branch
      if (role === 'owner') {
        const restaurant = await this.restaurantRepository.findOwnerIdById(branch.restaurant_id, tx);
        if (!restaurant || restaurant.owner_id !== context.userId) {
          const err = new Error('Forbidden: Not restaurant owner');
          err.status = 403;
          throw err;
        }
      } else {
        // Manager: phải thuộc restaurant đó (cách đơn giản theo schema hiện tại)
        const user = await this.userRepository.findById(context.userId);
        if (!user?.restaurant_id || user.restaurant_id !== branch.restaurant_id) {
          const err = new Error('Forbidden: Manager not in this restaurant');
          err.status = 403;
          throw err;
        }
      }

      // 3) Không trùng tên trong cùng branch
      const exists = await this.areaRepository.findByBranchAndName(branchId, name, tx);
      if (exists) {
        const err = new Error('Area name already exists in this branch');
        err.status = 409;
        throw err;
      }

      // 4) Create
      const now = new Date();
      const area = await this.areaRepository.create(
        {
          id: uuidv4(),
          branch_id: branchId,
          name,
          sort_order: dto.sortOrder ?? 0,
          created_at: now,
          updated_at: now,
          deleted_at: null,
        },
        tx
      );

      // 5) Return info
      return {
        id: area.id,
        branch_id: area.branch_id,
        name: area.name,
        sort_order: area.sort_order,
        created_at: area.created_at,
        updated_at: area.updated_at,
      };
    });
  }
}

module.exports = { CreateAreaUseCase };