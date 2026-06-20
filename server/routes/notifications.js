const express = require("express");
const router = express.Router();
const {
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
} = require("../models/notificationSettings");
const {
  NotificationTemplate,
  DEFAULT_NOTIFICATION_TEMPLATES,
} = require("../models/notificationTemplate");

const mapSettings = (doc) => ({
  _id: doc._id,
  id: doc._id,
  email: doc.email || DEFAULT_NOTIFICATION_SETTINGS.email,
  sms: doc.sms || DEFAULT_NOTIFICATION_SETTINGS.sms,
  dateUpdated: doc.updatedAt,
});

const mapTemplate = (doc) => ({
  _id: doc._id,
  id: doc._id,
  code: doc.code,
  name: doc.name,
  channel: doc.channel,
  subject: doc.subject || "",
  body: doc.body || "",
  status: doc.status || "active",
  dateUpdated: doc.updatedAt,
});

async function ensureDefaults() {
  const settingsCount = await NotificationSettings.countDocuments();
  if (settingsCount === 0) {
    await NotificationSettings.create(DEFAULT_NOTIFICATION_SETTINGS);
  }

  const templateCount = await NotificationTemplate.countDocuments();
  if (templateCount === 0) {
    await NotificationTemplate.insertMany(DEFAULT_NOTIFICATION_TEMPLATES);
  }
}

router.get("/settings", async (_req, res) => {
  try {
    await ensureDefaults();
    let doc = await NotificationSettings.findOne({ key: "default" });
    if (!doc) {
      doc = await NotificationSettings.create(DEFAULT_NOTIFICATION_SETTINGS);
    }
    return res.status(200).json({
      success: true,
      settings: mapSettings(doc),
    });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to load notification settings." });
  }
});

router.put("/settings", async (req, res) => {
  try {
    await ensureDefaults();
    const body = req.body;
    const updated = await NotificationSettings.findOneAndUpdate(
      { key: "default" },
      {
        email: {
          enabled: body.email?.enabled ?? true,
          fromName: body.email?.fromName || "",
          fromEmail: body.email?.fromEmail || "",
          replyTo: body.email?.replyTo || "",
        },
        sms: {
          enabled: body.sms?.enabled ?? true,
          senderId: body.sms?.senderId || "",
          provider: body.sms?.provider || "",
        },
      },
      { new: true, upsert: true }
    );
    return res.status(200).json(mapSettings(updated));
  } catch {
    return res.status(500).json({ success: false, message: "Failed to update notification settings." });
  }
});

router.get("/templates", async (_req, res) => {
  try {
    await ensureDefaults();
    const list = await NotificationTemplate.find().sort({ name: 1, channel: 1 });
    return res.status(200).json({
      success: true,
      templateList: list.map(mapTemplate),
    });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to load templates." });
  }
});

router.get("/templates/:id", async (req, res) => {
  try {
    const item = await NotificationTemplate.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Template not found." });
    }
    return res.status(200).json(mapTemplate(item));
  } catch {
    return res.status(500).json({ success: false, message: "Failed to load template." });
  }
});

router.put("/templates/:id", async (req, res) => {
  try {
    const body = req.body;
    const updated = await NotificationTemplate.findByIdAndUpdate(
      req.params.id,
      {
        name: body.name,
        subject: body.subject || "",
        body: body.body || "",
        status: body.status || "active",
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Template not found." });
    }

    return res.status(200).json(mapTemplate(updated));
  } catch {
    return res.status(500).json({ success: false, message: "Failed to update template." });
  }
});

module.exports = router;
