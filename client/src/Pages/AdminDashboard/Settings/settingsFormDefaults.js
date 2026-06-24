export const SETTINGS_TABS = [
  { id: "general", label: "General" },
  { id: "currency", label: "Currency" },
  { id: "tax", label: "Tax" },
  { id: "appearance", label: "Appearance" },
];

export const CURRENCY_OPTIONS = [
  { code: "LKR", symbol: "Rs", label: "Sri Lankan Rupee (LKR)" },
  { code: "USD", symbol: "$", label: "US Dollar (USD)" },
  { code: "EUR", symbol: "€", label: "Euro (EUR)" },
  { code: "GBP", symbol: "£", label: "British Pound (GBP)" },
  { code: "INR", symbol: "₹", label: "Indian Rupee (INR)" },
];

export const DECIMAL_FORMAT_OPTIONS = [
  { value: "0", label: "No decimals — 1,234" },
  { value: "2", label: "2 decimals — 1,234.56" },
  { value: "3", label: "3 decimals — 1,234.567" },
];

export const TAX_RULE_OPTIONS = [
  { value: "exclusive", label: "Prices exclude tax (tax added at checkout)" },
  { value: "inclusive", label: "Prices include tax" },
  { value: "none", label: "No tax applied" },
];

export const defaultSettingsFields = {
  general: {
    storeName: "",
    logo: { url: "", publicId: "" },
    favicon: { url: "", publicId: "" },
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
  },
  currency: {
    code: "LKR",
    symbol: "Rs",
    decimalFormat: "2",
  },
  tax: {
    enabled: true,
    rules: "exclusive",
    percentage: 0,
  },
};

export function normalizeSettingsAsset(asset) {
  if (!asset) return { url: "", publicId: "" };
  if (typeof asset === "string") return { url: asset, publicId: "" };
  return {
    url: asset.url || "",
    publicId: asset.publicId || "",
  };
}

export function settingsFromRecord(record) {
  return {
    general: {
      storeName: record?.general?.storeName || "",
      logo: normalizeSettingsAsset(record?.general?.logo),
      favicon: normalizeSettingsAsset(record?.general?.favicon),
      contactEmail: record?.general?.contactEmail || "",
      contactPhone: record?.general?.contactPhone || "",
      contactAddress: record?.general?.contactAddress || "",
    },
    currency: {
      code: record?.currency?.code || "LKR",
      symbol: record?.currency?.symbol || "Rs",
      decimalFormat: record?.currency?.decimalFormat || "2",
    },
    tax: {
      enabled: record?.tax?.enabled ?? true,
      rules: record?.tax?.rules || "exclusive",
      percentage: record?.tax?.percentage ?? 0,
    },
  };
}

export function settingsToPayload(formFields) {
  return {
    general: {
      ...formFields.general,
      logo: normalizeSettingsAsset(formFields.general?.logo),
      favicon: normalizeSettingsAsset(formFields.general?.favicon),
    },
    currency: { ...formFields.currency },
    tax: {
      enabled: Boolean(formFields.tax?.enabled),
      rules: formFields.tax?.rules || "exclusive",
      percentage: Number(formFields.tax?.percentage) || 0,
    },
  };
}

export function formatCurrencyPreview(code, symbol, decimalFormat) {
  const value = 1234.567;
  const decimals = Number(decimalFormat) || 0;
  const formatted = value.toLocaleString("en-LK", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${symbol} ${formatted} (${code})`;
}
