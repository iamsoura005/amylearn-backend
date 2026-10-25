'use strict';

const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const { httpError } = require('./apiHelpers');

function ensureConfigured() {
  if (!isCloudinaryConfigured()) {
    throw httpError(503, 'File storage is not configured. Set the Cloudinary credentials.');
  }
}

/**
 * Upload an in-memory buffer through Cloudinary's stream API.
 */
async function uploadBuffer(buffer, options = {}) {
  ensureConfigured();
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw httpError(400, 'An empty file cannot be uploaded.');
  }
  const {
    folder = 'amylearn',
    resourceType = 'auto',
    filename,
    publicId,
    tags = []
  } = options;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: publicId,
        use_filename: Boolean(filename),
        filename_override: filename,
        unique_filename: !publicId,
        overwrite: Boolean(publicId),
        tags
      },
      (error, result) => {
        if (error) {
          const wrapped = httpError(502, `Upload failed: ${error.message}`);
          return reject(wrapped);
        }
        return resolve(result);
      }
    );
    stream.end(buffer);
  });
}

async function uploadDataUri(dataUri, options = {}) {
  ensureConfigured();
  if (!dataUri || typeof dataUri !== 'string' || !dataUri.startsWith('data:')) {
    throw httpError(400, 'A valid data URI is required.');
  }
  try {
    return await cloudinary.uploader.upload(dataUri, {
      folder: options.folder || 'amylearn',
      resource_type: options.resourceType || 'auto',
      public_id: options.publicId
    });
  } catch (error) {
    throw httpError(502, `Upload failed: ${error.message}`);
  }
}

async function destroyAsset(publicId, resourceType = 'image') {
  if (!isCloudinaryConfigured() || !publicId) return { result: 'skipped' };
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    return { result: 'error', error: error.message };
  }
}

async function uploadBase64OrUrl(value, options = {}) {
  if (!value) return null;
  if (value.startsWith('data:')) return uploadDataUri(value, options);
  // Already hosted elsewhere: keep the URL untouched.
  return { secure_url: value };
}

module.exports = {
  uploadBuffer,
  uploadDataUri,
  uploadBase64OrUrl,
  destroyAsset,
  isCloudinaryConfigured
};
