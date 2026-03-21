const { ValidationError } = require('../../exception/validation-error');
const { UnauthorizedError } = require('../../exception/unauthorized-error');

class CreateCustomizationGroupUseCase {
  constructor(menuItemRepository, customizationRepository, userRepository) {
    this.menuItemRepository = menuItemRepository;
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
      throw new UnauthorizedError('Only Owner or Manager can create customization groups');
    }

    // 2. Validate menu item exists
    const menuItem = await this.menuItemRepository.findById(dto.menuItemId);
    if (!menuItem || menuItem.deleted_at) {
      throw new ValidationError('Menu item not found');
    }

    // 3. Validate min_select <= max_select
    if (dto.minSelect > dto.maxSelect) {
      throw new ValidationError('minSelect cannot be greater than maxSelect');
    }

    // 4. Create customization group
    const group = await this.customizationRepository.createGroup({
      name: dto.name,
      description: dto.description,
      minSelect: dto.minSelect,
      maxSelect: dto.maxSelect,
      isRequired: dto.isRequired,
    });

    // 5. Create customization options
    await this.customizationRepository.createOptions(group.id, dto.options);

    // 6. Link menu item with customization group
    await this.customizationRepository.linkMenuItem(dto.menuItemId, group.id);

    // 7. Return created group with options
    const createdGroup = await this.customizationRepository.findGroupById(group.id);

    return {
      groupId: createdGroup.id,
      menuItemId: dto.menuItemId,
      name: createdGroup.name,
      description: createdGroup.description,
      minSelect: createdGroup.min_select,
      maxSelect: createdGroup.max_select,
      isRequired: createdGroup.is_required,
      options: createdGroup.customization_options.map(opt => ({
        id: opt.id,
        name: opt.name,
        priceDelta: parseFloat(opt.price_delta),
        sortOrder: opt.sort_order,
        isAvailable: opt.is_available,
      })),
      createdAt: createdGroup.created_at,
    };
  }
}

module.exports = { CreateCustomizationGroupUseCase };