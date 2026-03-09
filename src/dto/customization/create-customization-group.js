const { z } = require('zod');

const CustomizationOptionSchema = z.object({
  name: z.string().min(1, 'Option name is required'),
  priceDelta: z.number().min(0, 'Price delta must be >= 0').default(0),
  sortOrder: z.number().int().min(0).default(0),
  isAvailable: z.boolean().default(true),
});

const CreateCustomizationGroupSchema = z.object({
  menuItemId: z.string().uuid('Invalid menu item ID'),
  name: z.string().min(1, 'Group name is required').max(100),
  description: z.string().max(255).optional(),
  minSelect: z.number().int().min(0).default(0),
  maxSelect: z.number().int().min(1).default(1),
  isRequired: z.boolean().default(false),
  options: z.array(CustomizationOptionSchema).min(1, 'At least one option is required'),
});

class CreateCustomizationGroupDto {
  constructor({
    menuItemId,
    name,
    description,
    minSelect,
    maxSelect,
    isRequired,
    options,
    userId,
  }) {
    this.menuItemId = menuItemId;
    this.name = name;
    this.description = description;
    this.minSelect = minSelect;
    this.maxSelect = maxSelect;
    this.isRequired = isRequired;
    this.options = options;
    this.userId = userId;
  }

  static validate(data) {
    const result = CreateCustomizationGroupSchema.safeParse(data);
    if (!result.success) {
      const errorMessages = result.error.errors.map(err => err.message).join(', ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }
    return result.data;
  }
}

module.exports = { CreateCustomizationGroupDto, CreateCustomizationGroupSchema };