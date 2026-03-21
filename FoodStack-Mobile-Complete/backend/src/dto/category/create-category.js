// src/dto/category/create-category.js

const { ValidationError } = require('../../exception/validation-error');

class CreateCategoryDto {
  constructor(data) {
    this.branchId = data.branchId;
    this.name = data.name;
    this.description = data.description;
    this.sortOrder = data.sortOrder;
    this.userId = data.userId;

    this.validate();
  }

  validate() {
    const errors = [];

    if (!this.branchId || this.branchId.trim().length === 0) {
      errors.push('Branch ID is required');
    }

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Category name is required');
    } else if (this.name.length > 255) {
      errors.push('Category name must not exceed 255 characters');
    }

    if (this.sortOrder !== undefined && (typeof this.sortOrder !== 'number' || this.sortOrder < 0)) {
      errors.push('Sort order must be a non-negative number');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }
  }
}

module.exports = { CreateCategoryDto };
