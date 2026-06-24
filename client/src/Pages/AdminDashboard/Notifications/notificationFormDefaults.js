export const NOTIFICATION_CHANNELS = [
  { id: "email", label: "Email notifications" },
  { id: "sms", label: "SMS notifications" },
];

export const TEMPLATE_PLACEHOLDERS = [
  "{{customerName}}",
  "{{orderNumber}}",
  "{{orderTotal}}",
  "{{trackingUrl}}",
];

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

export function previewTemplateBody(body, channel) {
  const sample = body || "";
  return sample
    .replace(/\{\{customerName\}\}/g, "Amaya")
    .replace(/\{\{orderNumber\}\}/g, "1001")
    .replace(/\{\{orderTotal\}\}/g, "Rs 12,450")
    .replace(/\{\{trackingUrl\}\}/g, "https://craftzlk.com/orders");
}

export function truncatePreview(text, limit = 72) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  if (value.length <= limit) return value || "—";
  return `${value.slice(0, limit)}…`;
}
