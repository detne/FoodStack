// src/dto/menu-item/create-menu-item.js

const { ValidationError } = require('../../exception/validation-error');

class CreateMenuItemDto {
  constructor(data) {
    this.categoryId = data.categoryId;
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.imageUrl = data.imageUrl;
    this.available = data.available;
    this.userId = data.userId;

    this.validate();
  }

  validate() {
    const errors = [];

    if (!this.categoryId || this.categoryId.trim().length === 0) {
      errors.push('Category ID is required');
    }

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Menu item name is required');
    } else if (this.name.length > 255) {
      errors.push('Menu item name must not exceed 255 characters');
    }

    if (this.price === undefined || this.price === null) {
      errors.push('Price is required');
    } else if (typeof this.price !== 'number' || this.price <= 0) {
      errors.push('Price must be a positive number');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }
  }
}

module.exports = { CreateMenuItemDto };
