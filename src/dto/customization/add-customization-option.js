const { z } = require('zod');

const AddCustomizationOptionSchema = z.object({
  groupId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format"),
  name: z.string().min(1, 'Option name is required').max(100),
  priceDelta: z.number().min(0, 'Price delta must be >= 0').default(0),
  sortOrder: z.number().int().min(0).default(0),
  isAvailable: z.boolean().default(true),
});

class AddCustomizationOptionDto {
  constructor({ groupId, name, priceDelta, sortOrder, isAvailable, userId }) {
    this.groupId = groupId;
    this.name = name;
    this.priceDelta = priceDelta;
    this.sortOrder = sortOrder;
    this.isAvailable = isAvailable;
    this.userId = userId;
  }

  static validate(data) {
    const result = AddCustomizationOptionSchema.safeParse(data);
    if (!result.success) {
      const errorMessages = result.error.errors.map(err => err.message).join(', ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }
    return result.data;
  }
}

module.exports = { AddCustomizationOptionDto, AddCustomizationOptionSchema };