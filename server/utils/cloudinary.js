require("dotenv/config");

const cloudinary = require("cloudinary").v2;

function getCloudinaryCredentials() {
  return {
    cloud_name:
      process.env.cloudinary_Config_Cloud_Name ||
      process.env.CLOUDINARY_CLOUD_NAME ||
      "",
    api_key:
      process.env.cloudinary_Config_api_key ||
      process.env.CLOUDINARY_API_KEY ||
      "",
    api_secret:
      process.env.cloudinary_Config_api_secret ||
      process.env.CLOUDINARY_API_SECRET ||
      "",
  };
}

function isCloudinaryConfigured() {
  const { cloud_name, api_key, api_secret } = getCloudinaryCredentials();
  return Boolean(cloud_name && api_key && api_secret);
}

function configureCloudinary() {
  const credentials = getCloudinaryCredentials();

  if (!isCloudinaryConfigured()) {
    return false;
  }

  cloudinary.config({
    ...credentials,
    secure: true,
  });

  return true;
}

configureCloudinary();

module.exports = cloudinary;
module.exports.isCloudinaryConfigured = isCloudinaryConfigured;
module.exports.getCloudinaryCredentials = getCloudinaryCredentials;
