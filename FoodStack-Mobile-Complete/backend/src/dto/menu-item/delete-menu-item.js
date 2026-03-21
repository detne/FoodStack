// src/dto/menu-item/delete-menu-item.js

const { ValidationError } = require('../../exception/validation-error');

class DeleteMenuItemDto {
  constructor(data) {
    this.menuItemId = data.menuItemId;
    this.userId = data.userId;

    this.validate();
  }

  validate() {
    const errors = [];

    if (!this.menuItemId || this.menuItemId.trim().length === 0) {
      errors.push('Menu item ID is required');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }
  }
}

module.exports = { DeleteMenuItemDto };
