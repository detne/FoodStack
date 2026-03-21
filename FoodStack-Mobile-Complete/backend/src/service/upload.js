// src/service/upload.js
const { v2: cloudinary } = require('cloudinary');
const { Readable } = require('stream');

class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  async uploadImage(file, options = {}) {
    try {
      const folder = options.folder || 'qr-service-platform';
      
      // Convert buffer to stream for Cloudinary
      const stream = Readable.from(file.buffer);

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: 'auto',
            overwrite: true,
          },
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
