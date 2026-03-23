// src/dto/menu-item/update-branch-availability.js

const { ValidationError } = require('../../exception/validation-error');

class UpdateBranchAvailabilityDto {
  constructor({ menuItemId, available, reason, userId, branchId }) {
    if (!menuItemId) {
      throw new ValidationError('Menu item ID is required');
    }

    if (typeof available !== 'boolean') {
      throw new ValidationError('Available must be a boolean value');
    }

    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    this.menuItemId = menuItemId;
    this.available = available;
    this.reason = reason;
    this.userId = userId;
    this.branchId = branchId; // Optional: can be provided by frontend
  }
}

module.exports = { UpdateBranchAvailabilityDto };
