class GetBranchDetailsUseCase {
  constructor(branchRepository) {
    this.branchRepository = branchRepository;
  }

  async execute(branchId) {
    const branch = await this.branchRepository.findById(branchId);

    if (!branch || branch.deleted_at) {
      const err = new Error('Branch not found');
      err.status = 404;
      throw err;
    }

    // trả full info + chuẩn hoá camelCase
    return {
      id: branch.id,
      restaurantId: branch.restaurant_id,
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      status: branch.status,
      createdAt: branch.created_at,
      updatedAt: branch.updated_at,
    };
  }
}

module.exports = { GetBranchDetailsUseCase };