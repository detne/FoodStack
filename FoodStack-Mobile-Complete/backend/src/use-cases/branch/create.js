class CreateBranchUseCase {
  constructor(branchRepository, restaurantRepository) {
    this.branchRepository = branchRepository;
    this.restaurantRepository = restaurantRepository;
  }

  async execute(dto, auth) {
    // ✅ Acceptance 1: Người dùng đã đăng nhập
    if (!auth?.userId) {
      const err = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    // ✅ Acceptance 2: Restaurant tồn tại
    const restaurant = await this.restaurantRepository.findById(dto.restaurantId);
    if (!restaurant) {
      const err = new Error('Restaurant not found');
      err.status = 404;
      throw err;
    }

    // ✅ (tuỳ chọn nhưng nên có) Chỉ owner của restaurant mới tạo branch
    // Nếu payload JWT của bạn có restaurantId thì check thẳng:
    if (auth.role === 'OWNER' && auth.restaurantId && String(auth.restaurantId) !== String(dto.restaurantId)) {
      const err = new Error('Forbidden: Not your restaurant');
      err.status = 403;
      throw err;
    }

    // ✅ Acceptance 4-5: gán branch vào đúng restaurant + lưu DB
    const created = await this.branchRepository.create({
      restaurantId: dto.restaurantId,
      name: dto.name,
      address: dto.address,
      phone: dto.phone,
      status: dto.status,
    });

    // ✅ Acceptance 6: trả về info branch vừa tạo
    return created;
  }
}

module.exports = { CreateBranchUseCase };