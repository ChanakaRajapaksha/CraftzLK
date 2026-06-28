const {
  AdminNotification,
  DEFAULT_ADMIN_NOTIFICATIONS,
} = require('../models/adminNotification');

class AdminNotificationsService {
  mapNotification(doc) {
    return {
      _id: doc._id,
      id: doc._id,
      type: doc.type,
      title: doc.title,
      message: doc.message || '',
      link: doc.link || '',
      read: Boolean(doc.read),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async ensureDefaults() {
    const count = await AdminNotification.countDocuments();
    if (count === 0) {
      await AdminNotification.insertMany(DEFAULT_ADMIN_NOTIFICATIONS);
    }
  }

  async list() {
    return AdminNotification.find().sort({ createdAt: -1 }).limit(50);
  }

  async countUnread() {
    return AdminNotification.countDocuments({ read: false });
  }

  async markAllRead() {
    await AdminNotification.updateMany({ read: false }, { read: true });
  }

  async markRead(id) {
    return AdminNotification.findByIdAndUpdate(id, { read: true }, { new: true });
  }
}

module.exports = new AdminNotificationsService();
