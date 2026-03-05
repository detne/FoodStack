// src/dto/restaurant/create-restaurant.js

const { ValidationError } = require('../../exception/validation-error');

class CreateRestaurantDto {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.logoUrl = data.logoUrl;
    this.ownerId = data.ownerId; // User ID của owner đang tạo restaurant

    this.validate();
  }

  validate() {
    const errors = [];

    // Restaurant name (required)
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Restaurant name is required');
    } else if (this.name.length > 255) {
      errors.push('Restaurant name must not exceed 255 characters');
    }

    // Email (required)
    if (!this.email || this.email.trim().length === 0) {
      errors.push('Restaurant email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        errors.push('Invalid email format');
      }
    }

    // Phone (optional but must be valid if provided)
    if (this.phone) {
      const phoneRegex = /^[0-9+\-\s()]{8,20}$/;
      if (!phoneRegex.test(this.phone)) {
        errors.push('Invalid phone format');
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }
  }
}

module.exports = { CreateRestaurantDto };
