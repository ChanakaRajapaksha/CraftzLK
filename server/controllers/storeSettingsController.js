const storeSettingsService = require("../services/storeSettingsService");

class StoreSettingsController {
  handleUploadError(error, res) {
    if (error?.message === "Only image uploads are allowed.") {
      return res.status(400).json({ success: false, message: error.message });
    }

    if (error?.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, message: "Image must be 5 MB or smaller." });
    }

    if (error?.message?.includes("Cloudinary is not configured")) {
      return res.status(503).json({ success: false, message: error.message });
    }

    console.error(error);
    return res.status(500).json({ success: false, message: "Upload failed." });
  }

  async uploadAsset(req, res, uploadError) {
    if (uploadError) {
      return this.handleUploadError(uploadError, res);
    }

    const assetType = req.params.assetType;

    if (!storeSettingsService.isValidAssetType(assetType)) {
      return res.status(400).json({ success: false, message: "Invalid asset type." });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image provided." });
    }

    const tempPath = req.file.path;

    try {
      const { uploadedAsset, updated } = await storeSettingsService.processUpload(
        assetType,
        tempPath
      );

      return res.status(200).json({
        success: true,
        asset: uploadedAsset,
        url: uploadedAsset.url,
        settings: storeSettingsService.mapSettings(updated),
      });
    } catch (error) {
      return this.handleUploadError(error, res);
    } finally {
      storeSettingsService.cleanupTempFile(tempPath);
    }
  }

  async deleteAsset(req, res) {
    const assetType = req.params.assetType;

    if (!storeSettingsService.isValidAssetType(assetType)) {
      return res.status(400).json({ success: false, message: "Invalid asset type." });
    }

    try {
      const { clearedAsset, updated } = await storeSettingsService.removeAsset(assetType);

      return res.status(200).json({
        success: true,
        asset: clearedAsset,
        settings: storeSettingsService.mapSettings(updated),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Failed to remove asset." });
    }
  }

  async get(_req, res) {
    try {
      const settings = await storeSettingsService.get();
      return res.status(200).json({
        success: true,
        settings,
      });
    } catch {
      return res.status(500).json({ success: false, message: "Failed to load settings." });
    }
  }

  async update(req, res) {
    try {
      const settings = await storeSettingsService.update(req.body);
      return res.status(200).json(settings);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Failed to update settings." });
    }
  }
}

module.exports = new StoreSettingsController();
