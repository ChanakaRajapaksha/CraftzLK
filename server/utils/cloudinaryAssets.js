const fs = require("fs");
const cloudinary = require("./cloudinary");
const { isCloudinaryConfigured } = cloudinary;

const CLOUDINARY_UPLOAD_MARKER = "/upload/";

const STORE_ASSET_FOLDERS = {
  logo: "craftzlk/store-settings/logo",
  favicon: "craftzlk/store-settings/favicon",
};

const STORE_ASSET_PUBLIC_IDS = {
  logo: "store-logo",
  favicon: "store-favicon",
};

function getPublicIdFromUrl(url) {
  if (!url || typeof url !== "string") return null;

  const idx = url.indexOf(CLOUDINARY_UPLOAD_MARKER);
  if (idx === -1) return null;

  let path = url.slice(idx + CLOUDINARY_UPLOAD_MARKER.length);
  path = path.replace(/^v\d+\//, "");

  const folderPaths = Object.values(STORE_ASSET_FOLDERS);
  for (const folder of folderPaths) {
    const folderIndex = path.indexOf(`${folder}/`);
    if (folderIndex !== -1) {
      const assetPath = path.slice(folderIndex);
      const dot = assetPath.lastIndexOf(".");
      return dot > -1 ? assetPath.slice(0, dot) : assetPath;
    }
  }

  const filename = path.split("/").pop() || "";
  const dot = filename.lastIndexOf(".");
  return dot > -1 ? filename.slice(0, dot) : filename || null;
}

async function destroyAsset(publicId) {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.error("Cloudinary destroy failed:", publicId, error.message);
  }
}

async function uploadStoreAsset(filePath, assetType) {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Set cloudinary_Config_Cloud_Name, cloudinary_Config_api_key, and cloudinary_Config_api_secret in server/.env."
    );
  }

  const folder = STORE_ASSET_FOLDERS[assetType];
  const publicId = STORE_ASSET_PUBLIC_IDS[assetType];

  if (!folder || !publicId) {
    throw new Error(`Unsupported store asset type: ${assetType}`);
  }

  const uploadOptions = {
    folder,
    public_id: publicId,
    overwrite: true,
    resource_type: "image",
    use_filename: false,
    unique_filename: false,
  };

  if (assetType === "favicon") {
    uploadOptions.transformation = [{ width: 128, height: 128, crop: "limit" }];
  }

  const result = await cloudinary.uploader.upload(filePath, uploadOptions);

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

function removeLocalFile(filePath) {
  if (!filePath) return;

  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error("Failed to remove temp upload:", filePath, error.message);
  }
}

module.exports = {
  STORE_ASSET_FOLDERS,
  STORE_ASSET_PUBLIC_IDS,
  getPublicIdFromUrl,
  destroyAsset,
  uploadStoreAsset,
  removeLocalFile,
};
