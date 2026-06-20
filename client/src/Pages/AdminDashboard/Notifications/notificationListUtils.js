const SAMPLE_SETTINGS = {
  _id: "sample-notification-settings",
  id: "sample-notification-settings",
  email: {
    enabled: true,
    fromName: "CraftzLK",
    fromEmail: "hello@craftzlk.com",
    replyTo: "hello@craftzlk.com",
  },
  sms: {
    enabled: true,
    senderId: "CraftzLK",
    provider: "Dialog",
  },
};

const SAMPLE_TEMPLATES = [
  {
    _id: "sample-notif-order-email",
    id: "sample-notif-order-email",
    code: "order_confirmation",
    name: "Order Confirmation",
    channel: "email",
    subject: "Order Confirmation — CraftzLK",
    body: "Hello {{customerName}},\n\nYour order #{{orderNumber}} has been received.\n\nThank you for shopping with CraftzLK.",
    status: "active",
    dateUpdated: "2026-06-10T10:00:00.000Z",
  },
  {
    _id: "sample-notif-order-sms",
    id: "sample-notif-order-sms",
    code: "order_confirmation",
    name: "Order Confirmation",
    channel: "sms",
    subject: "",
    body: "Your order #{{orderNumber}} has been received. — CraftzLK",
    status: "active",
    dateUpdated: "2026-06-10T10:00:00.000Z",
  },
  {
    _id: "sample-notif-shipped-email",
    id: "sample-notif-shipped-email",
    code: "order_shipped",
    name: "Order Shipped",
    channel: "email",
    subject: "Your order is on the way",
    body: "Hello {{customerName}},\n\nYour order #{{orderNumber}} has been shipped.",
    status: "active",
    dateUpdated: "2026-06-08T09:00:00.000Z",
  },
  {
    _id: "sample-notif-shipped-sms",
    id: "sample-notif-shipped-sms",
    code: "order_shipped",
    name: "Order Shipped",
    channel: "sms",
    subject: "",
    body: "Your order #{{orderNumber}} has been shipped. — CraftzLK",
    status: "active",
    dateUpdated: "2026-06-08T09:00:00.000Z",
  },
];

export function getNotificationSettingsSample() {
  return { ...SAMPLE_SETTINGS };
}

export function getNotificationTemplateSampleData() {
  return SAMPLE_TEMPLATES.map((item) => ({ ...item }));
}

export function isSampleNotificationTemplateId(id) {
  return String(id || "").startsWith("sample-notif-");
}
