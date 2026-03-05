// src/dto/category/delete-category.js

const { ValidationError } = require('../../exception/validation-error');

class DeleteCategoryDto {
  constructor(data) {
    this.categoryId = data.categoryId;
    this.userId = data.userId;

    this.validate();
  }

  validate() {
    const errors = [];

    if (!this.categoryId || this.categoryId.trim().length === 0) {
      errors.push('Category ID is required');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }
  }
}

module.exports = { DeleteCategoryDto };
