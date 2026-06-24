const { destroyAsset, getPublicIdFromUrl } = require("./cloudinaryAssets");

function normalizeAsset(asset) {
  if (!asset) return { url: "", publicId: "" };
  if (typeof asset === "string") {
    return {
      url: asset,
      publicId: getPublicIdFromUrl(asset) || "",
    };
  }

  return {
    url: asset.url || "",
    publicId: asset.publicId || getPublicIdFromUrl(asset.url) || "",
  };
}

async function clearStoreAsset(asset) {
  const normalized = normalizeAsset(asset);
  if (normalized.publicId) {
    await destroyAsset(normalized.publicId);
  } else if (normalized.url) {
    const derivedId = getPublicIdFromUrl(normalized.url);
    if (derivedId) await destroyAsset(derivedId);
  }

  return { url: "", publicId: "" };
}

async function replaceStoreAsset(currentAsset, nextAsset) {
  const current = normalizeAsset(currentAsset);
  const next = normalizeAsset(nextAsset);

  if (!next.url) {
    return clearStoreAsset(current);
  }

  if (next.url === current.url) {
    return {
      url: current.url,
      publicId: next.publicId || current.publicId,
    };
  }

  if (current.url) {
    await clearStoreAsset(current);
  }

  return next;
}

module.exports = {
  normalizeAsset,
  clearStoreAsset,
  replaceStoreAsset,
};
