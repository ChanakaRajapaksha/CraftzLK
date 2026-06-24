const {
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
} = require("../models/notificationSettings");
const { decrypt } = require("../utils/encryption");

async function getNotificationEmailConfig() {
  let doc = await NotificationSettings.findOne({ key: "default" });

  if (!doc) {
    doc = await NotificationSettings.create(DEFAULT_NOTIFICATION_SETTINGS);
  }

  const email = doc.email || DEFAULT_NOTIFICATION_SETTINGS.email;

  let smtpPass = "";
  if (email.emailPasswordEncrypted) {
    try {
      smtpPass = decrypt(email.emailPasswordEncrypted);
    } catch (error) {
      console.error("[notificationEmailConfig] Failed to decrypt email password:", error.message);
    }
  }

  const fromEmail = email.fromEmail || process.env.EMAIL_USER || "";
  const fromName = email.fromName || "CraftzLK";
  const replyTo = email.replyTo || fromEmail || "";

  return {
    enabled: email.enabled !== false,
    fromName,
    fromEmail,
    replyTo,
    smtpUser: fromEmail || process.env.EMAIL_USER || "",
    smtpPass: smtpPass || process.env.EMAIL_PASS || "",
  };
}

module.exports = { getNotificationEmailConfig };
