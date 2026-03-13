const { v2: cloudinary } = require('cloudinary');

class CloudinaryUploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  /**
   * Upload PNG buffer to Cloudinary
   * @param {Buffer} buffer PNG buffer
   * @param {Object} opts
   * @param {string} opts.folder Folder in cloudinary
   * @param {string} opts.publicId Public ID (without extension)
   * @returns {Promise<{ url: string, publicId: string }>}
   */
  async uploadPngBuffer(buffer, { folder, publicId }) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'image',
          format: 'png',
          overwrite: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      );

      uploadStream.end(buffer);
    });
  }
}

module.exports = { CloudinaryUploadService };