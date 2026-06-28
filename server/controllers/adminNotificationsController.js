const adminNotificationsService = require('../services/adminNotificationsService');

class AdminNotificationsController {
  async list(req, res) {
    try {
      await adminNotificationsService.ensureDefaults();
      const list = await adminNotificationsService.list();
      const unreadCount = await adminNotificationsService.countUnread();
      return res.status(200).json({
        success: true,
        notificationList: list.map((doc) => adminNotificationsService.mapNotification(doc)),
        unreadCount,
      });
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to load notifications.' });
    }
  }

  async readAll(req, res) {
    try {
      await adminNotificationsService.ensureDefaults();
      await adminNotificationsService.markAllRead();
      const unreadCount = await adminNotificationsService.countUnread();
      return res.status(200).json({ success: true, unreadCount });
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to mark notifications as read.' });
    }
  }

  async markRead(req, res) {
    try {
      const updated = await adminNotificationsService.markRead(req.params.id);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Notification not found.' });
      }
      const unreadCount = await adminNotificationsService.countUnread();
      return res.status(200).json({
        success: true,
        notification: adminNotificationsService.mapNotification(updated),
        unreadCount,
      });
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to update notification.' });
    }
  }
}

module.exports = new AdminNotificationsController();
