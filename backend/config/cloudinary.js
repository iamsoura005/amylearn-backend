'use strict';

const cloudinary = require('cloudinary').v2;

const config = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
};

const configured = Boolean(config.cloud_name && config.api_key && config.api_secret);

if (configured) {
  cloudinary.config(config);
}

function isCloudinaryConfigured() {
  return configured;
}

module.exports = { cloudinary, isCloudinaryConfigured };
