export const NOTIFICATION_CHANNELS = [
  { id: "email", label: "Email notifications" },
  { id: "sms", label: "SMS notifications" },
];

export const TEMPLATE_CATEGORIES = [
  { id: "all", label: "All categories" },
  { id: "account", label: "Account" },
  { id: "newsletter", label: "Newsletter" },
  { id: "order", label: "Orders" },
  { id: "general", label: "General" },
];

export const TEMPLATE_PLACEHOLDERS_BY_CODE = {
  welcome: ["{{customerName}}", "{{storeName}}", "{{supportEmail}}"],
  password_reset: ["{{customerName}}", "{{resetUrl}}", "{{storeName}}"],
  password_changed: ["{{customerName}}", "{{storeName}}", "{{supportEmail}}"],
  temporary_password: ["{{customerName}}", "{{temporaryPassword}}", "{{signInUrl}}", "{{storeName}}"],
  newsletter_confirm: ["{{confirmUrl}}", "{{storeName}}", "{{unsubscribeUrl}}"],
  newsletter_welcome: ["{{storeName}}", "{{shopUrl}}", "{{unsubscribeUrl}}"],
  order_placed: [
    "{{customerName}}",
    "{{storeName}}",
    "{{orderNumber}}",
    "{{orderDate}}",
    "{{paymentMethod}}",
    "{{paymentStatus}}",
    "{{itemsList}}",
    "{{subtotal}}",
    "{{deliveryCharge}}",
    "{{discount}}",
    "{{tax}}",
    "{{total}}",
    "{{deliveryAddress}}",
    "{{city}}",
    "{{postalCode}}",
    "{{phoneNumber}}",
    "{{orderViewUrl}}",
    "{{supportEmail}}",
  ],
  order_confirmed: [
    "{{customerName}}",
    "{{storeName}}",
    "{{orderNumber}}",
    "{{orderDate}}",
    "{{paymentStatus}}",
    "{{itemsList}}",
    "{{subtotal}}",
    "{{deliveryCharge}}",
    "{{discount}}",
    "{{tax}}",
    "{{total}}",
    "{{deliveryAddress}}",
    "{{city}}",
    "{{postalCode}}",
    "{{orderViewUrl}}",
    "{{supportEmail}}",
  ],
  order_shipped: [
    "{{customerName}}",
    "{{storeName}}",
    "{{orderNumber}}",
    "{{shippedDate}}",
    "{{courierName}}",
    "{{trackingNumber}}",
    "{{itemsList}}",
    "{{deliveryAddress}}",
    "{{city}}",
    "{{postalCode}}",
    "{{estimatedDeliveryDate}}",
    "{{trackingUrl}}",
    "{{supportEmail}}",
  ],
  order_delivered: [
    "{{customerName}}",
    "{{storeName}}",
    "{{orderNumber}}",
    "{{deliveredDate}}",
    "{{deliveryAddress}}",
    "{{itemsList}}",
    "{{total}}",
    "{{orderViewUrl}}",
    "{{reviewUrl}}",
    "{{supportEmail}}",
  ],
};

export const TEMPLATE_PLACEHOLDERS = [
  "{{customerName}}",
  "{{storeName}}",
  "{{orderNumber}}",
  "{{orderTotal}}",
  "{{trackingUrl}}",
];

const PREVIEW_SAMPLE_VALUES = {
  customerName: "Amaya Perera",
  storeName: "CraftzLK",
  orderNumber: "1001",
  orderDate: "August 28, 2026",
  paymentMethod: "Cash on Delivery",
  paymentStatus: "Pending",
  itemsList: "Handwoven Basket × 2\nRs 5,000.00",
  subtotal: "Rs 5,000.00",
  deliveryCharge: "Rs 350.00",
  discount: "500.00",
  tax: "Rs 0.00",
  total: "Rs 4,850.00",
  orderTotal: "Rs 4,850.00",
  deliveryAddress: "12 Temple Road, Colombo",
  city: "Colombo",
  postalCode: "00500",
  phoneNumber: "+94 77 123 4567",
  orderViewUrl: "https://craftzlk.com/orders",
  reviewUrl: "https://craftzlk.com/products",
  trackingUrl: "https://craftzlk.com/orders",
  trackingNumber: "TRK123456789",
  courierName: "Domex",
  shippedDate: "August 28, 2026",
  deliveredDate: "August 30, 2026",
  estimatedDeliveryDate: "August 31, 2026",
  supportEmail: "hello@craftzlk.com",
  resetUrl: "https://craftzlk.com/reset-password?token=sample",
  temporaryPassword: "TempPass123!",
  signInUrl: "https://craftzlk.com/signIn",
  confirmUrl: "https://craftzlk.com/newsletter/confirm?token=sample",
  unsubscribeUrl: "https://craftzlk.com/newsletter/unsubscribe?token=sample",
  shopUrl: "https://craftzlk.com/products",
};

export const defaultNotificationSettings = {
  email: {
    enabled: true,
    fromName: "CraftzLK",
    fromEmail: "",
    replyTo: "",
    emailPassword: "",
    hasPassword: false,
  },
  sms: {
    enabled: true,
    senderId: "CraftzLK",
    provider: "",
  },
};

export const defaultTemplateFields = {
  name: "",
  subject: "",
  body: "",
  status: "active",
};

function parseEnabledFlag(value, fallback = true) {
  if (value === 1 || value === "1" || value === true) return true;
  if (value === 0 || value === "0" || value === false) return false;
  return fallback;
}

export function settingsFromRecord(record) {
  return {
    email: {
      enabled: parseEnabledFlag(
        record?.email?.email_enabled ?? record?.email?.enabled,
        true
      ),
      fromName: record?.email?.fromName || "",
      fromEmail: record?.email?.fromEmail || "",
      replyTo: record?.email?.replyTo || "",
      emailPassword: "",
      hasPassword: Boolean(record?.email?.hasPassword),
    },
    sms: {
      enabled: parseEnabledFlag(
        record?.sms?.sms_enabled ?? record?.sms?.enabled,
        true
      ),
      senderId: record?.sms?.senderId || "",
      provider: record?.sms?.provider || "",
    },
  };
}

export function settingsToPayload(formFields) {
  const emailEnabled = Boolean(formFields.email?.enabled);
  const smsEnabled = Boolean(formFields.sms?.enabled);

  const payload = {
    email: {
      enabled: emailEnabled,
      email_enabled: emailEnabled ? 1 : 0,
      fromName: formFields.email?.fromName || "",
      fromEmail: formFields.email?.fromEmail || "",
      replyTo: formFields.email?.replyTo || "",
    },
    sms: {
      enabled: smsEnabled,
      sms_enabled: smsEnabled ? 1 : 0,
      senderId: formFields.sms?.senderId || "",
      provider: formFields.sms?.provider || "",
    },
  };

  if (formFields.email?.emailPassword?.trim()) {
    payload.email.emailPassword = formFields.email.emailPassword.trim();
  }

  return payload;
}

export function templateFromRecord(record) {
  return {
    name: record?.name || "",
    subject: record?.subject || "",
    body: record?.body || "",
    status: record?.status || "active",
  };
}

export function templateToPayload(formFields) {
  return {
    name: formFields.name,
    subject: formFields.subject || "",
    body: formFields.body || "",
    status: formFields.status || "active",
  };
}

export function getChannelLabel(channel) {
  return channel === "sms" ? "SMS" : "Email";
}

export function getCategoryLabel(category) {
  const map = {
    account: "Account",
    newsletter: "Newsletter",
    order: "Orders",
    general: "General",
  };
  return map[category] || "General";
}

export function getPlaceholdersForTemplate(templateMeta) {
  if (Array.isArray(templateMeta?.placeholders) && templateMeta.placeholders.length) {
    return templateMeta.placeholders;
  }
  if (templateMeta?.code && TEMPLATE_PLACEHOLDERS_BY_CODE[templateMeta.code]) {
    return TEMPLATE_PLACEHOLDERS_BY_CODE[templateMeta.code];
  }
  return TEMPLATE_PLACEHOLDERS;
}

export function previewTemplateBody(body, channel, subject = "") {
  let sample = body || "";
  if (channel === "email" && subject) {
    sample = `Subject: ${subject}\n\n${sample}`;
  }

  return sample.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(PREVIEW_SAMPLE_VALUES, key)) {
      return PREVIEW_SAMPLE_VALUES[key];
    }
    return match;
  });
}

export function truncatePreview(text, limit = 72) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  if (value.length <= limit) return value || "—";
  return `${value.slice(0, limit)}…`;
}
