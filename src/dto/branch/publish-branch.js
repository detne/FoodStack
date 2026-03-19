const { z } = require('zod');

// Validation schema for publishing/unpublishing branch
const PublishBranchSchema = z.object({
  isPublished: z.boolean({
    required_error: 'isPublished field is required',
    invalid_type_error: 'isPublished must be a boolean'
  })
});

module.exports = { PublishBranchSchema };