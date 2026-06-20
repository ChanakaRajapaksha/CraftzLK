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

export function settingsFromRecord(record) {
  return {
    email: {
      enabled: record?.email?.enabled ?? true,
      fromName: record?.email?.fromName || "",
      fromEmail: record?.email?.fromEmail || "",
      replyTo: record?.email?.replyTo || "",
    },
    sms: {
      enabled: record?.sms?.enabled ?? true,
      senderId: record?.sms?.senderId || "",
      provider: record?.sms?.provider || "",
    },
  };
}

export function settingsToPayload(formFields) {
  return {
    email: {
      enabled: Boolean(formFields.email?.enabled),
      fromName: formFields.email?.fromName || "",
      fromEmail: formFields.email?.fromEmail || "",
      replyTo: formFields.email?.replyTo || "",
    },
    sms: {
      enabled: Boolean(formFields.sms?.enabled),
      senderId: formFields.sms?.senderId || "",
      provider: formFields.sms?.provider || "",
    },
  };
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
