// src/service/upload.js
const { v2: cloudinary } = require('cloudinary');
const { Readable } = require('stream');

class UploadService {
  constructor() {
    const config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    };
    
    console.log('Cloudinary config:', {
      cloud_name: config.cloud_name,
      api_key: config.api_key ? '***' + config.api_key.slice(-4) : 'missing',
      api_secret: config.api_secret ? '***' : 'missing',
    });
    
    cloudinary.config(config);
  }

  async uploadImage(file, options = {}) {
    try {
      const folder = options.folder || 'qr-service-platform';
      const transformation = options.transformation || {};
      
      // Convert buffer to stream for Cloudinary
      const stream = Readable.from(file.buffer);

      return new Promise((resolve, reject) => {
        const uploadOptions = {
          folder: folder,
          resource_type: 'auto',
          overwrite: true,
        };

        // Add transformation options if provided
        if (transformation.width) uploadOptions.width = transformation.width;
        if (transformation.height) uploadOptions.height = transformation.height;
        if (transformation.crop) uploadOptions.crop = transformation.crop;
        if (transformation.quality) uploadOptions.quality = transformation.quality;

        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(new Error('Failed to upload file to Cloudinary'));
            } else {
              console.log(`✅ Image uploaded successfully: ${result.secure_url}`);
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
              });
            }
          }
        );

        stream.pipe(uploadStream);
      });
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload file');
    }
  }

  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log(`✅ Image deleted: ${publicId}`);
      return result.result === 'ok';
    } catch (error) {
      console.error('Delete error:', error);
      throw new Error('Failed to delete file');
    }
  }
}

module.exports = { UploadService };
