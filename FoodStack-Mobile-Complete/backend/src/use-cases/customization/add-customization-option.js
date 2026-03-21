const { ValidationError } = require('../../exception/validation-error');
const { UnauthorizedError } = require('../../exception/unauthorized-error');

class AddCustomizationOptionUseCase {
  constructor(customizationRepository, userRepository) {
    this.customizationRepository = customizationRepository;
    this.userRepository = userRepository;
  }

  async execute(dto) {
    // 1. Validate user role (Owner/Manager)
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!['OWNER', 'MANAGER'].includes(user.role)) {
      throw new UnauthorizedError('Only Owner or Manager can add customization options');
    }

    // 2. Validate customization group exists
    const group = await this.customizationRepository.findGroupById(dto.groupId);
    if (!group) {
      throw new ValidationError('Customization group not found');
    }

    // 3. Add the option
    const option = await this.customizationRepository.addOption(dto.groupId, {
      name: dto.name,
      priceDelta: dto.priceDelta,
      sortOrder: dto.sortOrder,
      isAvailable: dto.isAvailable,
    });

    return {
      optionId: option.id,
      groupId: dto.groupId,
      name: option.name,
      priceDelta: parseFloat(option.price_delta),
      sortOrder: option.sort_order,
      isAvailable: option.is_available,
      createdAt: option.created_at,
    };
  }
}

module.exports = { AddCustomizationOptionUseCase };