// src/dto/category/update-category.js

const { ValidationError } = require('../../exception/validation-error');

class UpdateCategoryDto {
  constructor(data) {
    this.categoryId = data.categoryId;
    this.name = data.name;
    this.description = data.description;
    this.sortOrder = data.sortOrder;
    this.userId = data.userId;

    this.validate();
  }

  validate() {
    const errors = [];

    if (!this.categoryId || this.categoryId.trim().length === 0) {
      errors.push('Category ID is required');
    }

    if (this.name !== undefined) {
      if (!this.name || this.name.trim().length === 0) {
        errors.push('Category name cannot be empty');
      } else if (this.name.length > 255) {
        errors.push('Category name must not exceed 255 characters');
      }
    }

    if (this.sortOrder !== undefined && (typeof this.sortOrder !== 'number' || this.sortOrder < 0)) {
      errors.push('Sort order must be a non-negative number');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }
  }
}

module.exports = { UpdateCategoryDto };
