const {
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
} = require('../models/notificationSettings');
const {
  NotificationTemplate,
  DEFAULT_NOTIFICATION_TEMPLATES,
} = require('../models/notificationTemplate');
const { encrypt } = require('../utils/encryption');

function parseEnabled(value, fallback = true) {
  if (value === 1 || value === '1' || value === true) return true;
  if (value === 0 || value === '0' || value === false) return false;
  return fallback;
}

const mapSettings = (doc) => ({
  _id: doc._id,
  id: doc._id,
  email: {
    enabled: doc.email?.enabled !== false,
    email_enabled: doc.email?.enabled !== false ? 1 : 0,
    fromName: doc.email?.fromName || '',
    fromEmail: doc.email?.fromEmail || '',
    replyTo: doc.email?.replyTo || '',
    hasPassword: Boolean(doc.email?.emailPasswordEncrypted),
  },
  sms: {
    enabled: doc.sms?.enabled !== false,
    sms_enabled: doc.sms?.enabled !== false ? 1 : 0,
    senderId: doc.sms?.senderId || '',
    provider: doc.sms?.provider || '',
  },
  dateUpdated: doc.updatedAt,
});

const mapTemplate = (doc) => ({
  _id: doc._id,
  id: doc._id,
  code: doc.code,
  name: doc.name,
  channel: doc.channel,
  subject: doc.subject || '',
  body: doc.body || '',
  status: doc.status || 'active',
  dateUpdated: doc.updatedAt,
});

class NotificationService {
  async ensureDefaults() {
    const settingsCount = await NotificationSettings.countDocuments();
    if (settingsCount === 0) {
      await NotificationSettings.create(DEFAULT_NOTIFICATION_SETTINGS);
    }

    const templateCount = await NotificationTemplate.countDocuments();
    if (templateCount === 0) {
      await NotificationTemplate.insertMany(DEFAULT_NOTIFICATION_TEMPLATES);
    }
  }

  async getSettings() {
    await this.ensureDefaults();
    let doc = await NotificationSettings.findOne({ key: 'default' });
    if (!doc) {
      doc = await NotificationSettings.create(DEFAULT_NOTIFICATION_SETTINGS);
    }
    return mapSettings(doc);
  }

  async updateSettings(body) {
    await this.ensureDefaults();
    const existing = await NotificationSettings.findOne({ key: 'default' });

    const emailEnabled = parseEnabled(
      body.email?.email_enabled ?? body.email?.enabled,
      existing?.email?.enabled ?? true
    );
    const smsEnabled = parseEnabled(
      body.sms?.sms_enabled ?? body.sms?.enabled,
      existing?.sms?.enabled ?? true
    );

    const plainPassword =
      body.email?.emailPassword?.trim() ||
      body.email?.smtpPassword?.trim() ||
      '';

    const nextEncryptedPassword = plainPassword
      ? encrypt(plainPassword)
      : existing?.email?.emailPasswordEncrypted || '';

    const updated = await NotificationSettings.findOneAndUpdate(
      { key: 'default' },
      {
        email: {
          enabled: emailEnabled,
          fromName: body.email?.fromName || '',
          fromEmail: body.email?.fromEmail || '',
          replyTo: body.email?.replyTo || '',
          emailPasswordEncrypted: nextEncryptedPassword,
        },
        sms: {
          enabled: smsEnabled,
          senderId: body.sms?.senderId || '',
          provider: body.sms?.provider || '',
        },
      },
      { new: true, upsert: true }
    );

    return mapSettings(updated);
  }

  async getTemplates() {
    await this.ensureDefaults();
    const list = await NotificationTemplate.find().sort({ name: 1, channel: 1 });
    return list.map(mapTemplate);
  }

  async getTemplateById(id) {
    const item = await NotificationTemplate.findById(id);
    if (!item) {
      const error = new Error('Template not found.');
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }
    return mapTemplate(item);
  }

  async updateTemplate(id, body) {
    const updated = await NotificationTemplate.findByIdAndUpdate(
      id,
      {
        name: body.name,
        subject: body.subject || '',
        body: body.body || '',
        status: body.status || 'active',
      },
      { new: true }
    );

    if (!updated) {
      const error = new Error('Template not found.');
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    return mapTemplate(updated);
  }
}

module.exports = new NotificationService();
