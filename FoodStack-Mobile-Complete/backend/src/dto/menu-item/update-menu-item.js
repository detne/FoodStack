// src/dto/menu-item/update-menu-item.js

const { ValidationError } = require('../../exception/validation-error');

class UpdateMenuItemDto {
  constructor(data) {
    this.menuItemId = data.menuItemId;
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.categoryId = data.categoryId;
    this.imageUrl = data.imageUrl;
    this.available = data.available;
    this.userId = data.userId;

    this.validate();
  }

  validate() {
    const errors = [];

    if (!this.menuItemId || this.menuItemId.trim().length === 0) {
      errors.push('Menu item ID is required');
    }

    if (this.name !== undefined) {
      if (!this.name || this.name.trim().length === 0) {
        errors.push('Menu item name cannot be empty');
      } else if (this.name.length > 255) {
        errors.push('Menu item name must not exceed 255 characters');
      }
    }

    if (this.price !== undefined && (typeof this.price !== 'number' || this.price <= 0)) {
      errors.push('Price must be a positive number');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }
  }
}

module.exports = { UpdateMenuItemDto };
