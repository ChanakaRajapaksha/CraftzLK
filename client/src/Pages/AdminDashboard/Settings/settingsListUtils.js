export function getSettingsSample() {
  return {
    _id: "sample-settings",
    id: "sample-settings",
    general: {
      storeName: "CraftzLK",
      logo: "",
      favicon: "",
      contactEmail: "hello@craftzlk.com",
      contactPhone: "+94 71 526 4449",
      contactAddress: "Colombo, Sri Lanka",
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
    email: {
      smtpHost: "smtp.gmail.com",
      smtpPort: 587,
      smtpUsername: "",
      smtpPassword: "",
      hasPassword: false,
    },
  };
}

export function isSampleSettingsId(id) {
  return String(id || "") === "sample-settings";
}
