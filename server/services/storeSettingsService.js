const { StoreSettings, DEFAULT_STORE_SETTINGS } = require("../models/storeSettings");
const {
  destroyAsset,
  removeLocalFile,
  uploadStoreAsset,
} = require("../utils/cloudinaryAssets");
const {
  clearStoreAsset,
  normalizeAsset,
  replaceStoreAsset,
} = require("../utils/storeSettingsAssets");

const STORE_ASSET_TYPES = new Set(["logo", "favicon"]);

class StoreSettingsService {
  isValidAssetType(assetType) {
    return STORE_ASSET_TYPES.has(assetType);
  }

  mapSettings(doc) {
    return {
      _id: doc._id,
      id: doc._id,
      general: {
        ...(doc.general || DEFAULT_STORE_SETTINGS.general),
        logo: normalizeAsset(doc.general?.logo),
        favicon: normalizeAsset(doc.general?.favicon),
      },
      currency: doc.currency || DEFAULT_STORE_SETTINGS.currency,
      tax: doc.tax || DEFAULT_STORE_SETTINGS.tax,
      dateUpdated: doc.updatedAt,
    };
  }

  async getOrCreateSettings() {
    let doc = await StoreSettings.findOne({ key: "default" });
    if (!doc) {
      doc = await StoreSettings.create(DEFAULT_STORE_SETTINGS);
    } else if (doc.email !== undefined) {
      await StoreSettings.updateOne({ key: "default" }, { $unset: { email: 1 } });
      doc = await StoreSettings.findOne({ key: "default" });
    }
    return doc;
  }

  async persistStoreAsset(assetType, asset) {
    return StoreSettings.findOneAndUpdate(
      { key: "default" },
      { $set: { [`general.${assetType}`]: asset } },
      { new: true, upsert: true }
    );
  }

  async processUpload(assetType, tempPath) {
    const settings = await this.getOrCreateSettings();
    const currentAsset = normalizeAsset(settings.general?.[assetType]);
    const uploadedAsset = await uploadStoreAsset(tempPath, assetType);

    if (
      currentAsset.publicId &&
      currentAsset.publicId !== uploadedAsset.publicId
    ) {
      await destroyAsset(currentAsset.publicId);
    }

    const updated = await this.persistStoreAsset(assetType, uploadedAsset);

    return { uploadedAsset, updated };
  }

  async removeAsset(assetType) {
    const settings = await this.getOrCreateSettings();
    const clearedAsset = await clearStoreAsset(settings.general?.[assetType]);
    const updated = await this.persistStoreAsset(assetType, clearedAsset);

    return { clearedAsset, updated };
  }

  async get() {
    const doc = await this.getOrCreateSettings();
    return this.mapSettings(doc);
  }

  async update(body) {
    const existing = await this.getOrCreateSettings();

    const logo = await replaceStoreAsset(
      existing.general?.logo,
      body.general?.logo
    );
    const favicon = await replaceStoreAsset(
      existing.general?.favicon,
      body.general?.favicon
    );

    const update = {
      general: {
        storeName: body.general?.storeName || "",
        logo,
        favicon,
        contactEmail: body.general?.contactEmail || "",
        contactPhone: body.general?.contactPhone || "",
        contactAddress: body.general?.contactAddress || "",
      },
      currency: {
        code: body.currency?.code || "LKR",
        symbol: body.currency?.symbol || "Rs",
        decimalFormat: body.currency?.decimalFormat || "2",
      },
      tax: {
        enabled: body.tax?.enabled ?? true,
        rules: body.tax?.rules || "exclusive",
        percentage: Number(body.tax?.percentage) || 0,
      },
    };

    const updated = await StoreSettings.findOneAndUpdate(
      { key: "default" },
      { $set: update, $unset: { email: 1 } },
      { new: true, upsert: true }
    );

    return this.mapSettings(updated);
  }

  cleanupTempFile(tempPath) {
    removeLocalFile(tempPath);
  }
}

module.exports = new StoreSettingsService();
