const { z } = require('zod');

const UpdateMenuItemAvailabilitySchema = z.object({
  available: z.boolean({
    required_error: 'Available status is required',
    invalid_type_error: 'Available must be a boolean',
  }),
});

class UpdateMenuItemAvailabilityDto {
  constructor({ menuItemId, available, userId }) {
    this.menuItemId = menuItemId;
    this.available = available;
    this.userId = userId;
  }

  static validate(data) {
    const result = UpdateMenuItemAvailabilitySchema.safeParse(data);
    if (!result.success) {
      const errorMessages = result.error.errors.map(err => err.message).join(', ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }
    return result.data;
  }
}

module.exports = { UpdateMenuItemAvailabilityDto, UpdateMenuItemAvailabilitySchema };