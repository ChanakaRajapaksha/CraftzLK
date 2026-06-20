const express = require("express");
const router = express.Router();
const {
  AdminNotification,
  DEFAULT_ADMIN_NOTIFICATIONS,
} = require("../models/adminNotification");

const mapNotification = (doc) => ({
  _id: doc._id,
  id: doc._id,
  type: doc.type,
  title: doc.title,
  message: doc.message || "",
  link: doc.link || "",
  read: Boolean(doc.read),
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

async function ensureDefaults() {
  const count = await AdminNotification.countDocuments();
  if (count === 0) {
    await AdminNotification.insertMany(DEFAULT_ADMIN_NOTIFICATIONS);
  }
}

router.get("/", async (_req, res) => {
  try {
    await ensureDefaults();
    const list = await AdminNotification.find().sort({ createdAt: -1 }).limit(50);
    const unreadCount = await AdminNotification.countDocuments({ read: false });
    return res.status(200).json({
      success: true,
      notificationList: list.map(mapNotification),
      unreadCount,
    });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to load notifications." });
  }
});

router.put("/read-all", async (_req, res) => {
  try {
    await ensureDefaults();
    await AdminNotification.updateMany({ read: false }, { read: true });
    const unreadCount = await AdminNotification.countDocuments({ read: false });
    return res.status(200).json({ success: true, unreadCount });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to mark notifications as read." });
  }
});

router.put("/:id/read", async (req, res) => {
  try {
    const updated = await AdminNotification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }
    const unreadCount = await AdminNotification.countDocuments({ read: false });
    return res.status(200).json({
      success: true,
      notification: mapNotification(updated),
      unreadCount,
    });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to update notification." });
  }
});

module.exports = router;
