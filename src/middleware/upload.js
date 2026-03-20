const multer = require('multer');
const { BadRequestError } = require('../exception/http-errors');
const { FILE_VALIDATION, validateFile } = require('../dto/branch/upload-branding-image');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  if (FILE_VALIDATION.ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('File must be an image (JPEG, PNG, WebP)'), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max (will be validated per image type in use case)
    files: 1 // Only allow 1 file at a time
  }
});

// Middleware for single file upload
const uploadSingle = upload.single('file');

// Wrapper middleware with better error handling
function createUploadMiddleware() {
  return (req, res, next) => {
    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new BadRequestError('File size too large. Maximum 10MB allowed.'));
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(new BadRequestError('Too many files. Only 1 file allowed.'));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new BadRequestError('Unexpected field name. Use "file" as field name.'));
        }
        return next(new BadRequestError(`Upload error: ${err.message}`));
      }
      
      if (err) {
        return next(err);
      }

      // Validate file exists
      if (!req.file) {
        return next(new BadRequestError('No file uploaded. Please select a file.'));
      }

      // Additional validation will be done in the use case
      next();
    });
  };
}

module.exports = { createUploadMiddleware };