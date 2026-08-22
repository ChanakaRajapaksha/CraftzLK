const { AdminNotification } = require('../models/adminNotification');
const { emitAdminNotification } = require('../realtime/adminNotificationSocket');

const SEED_ADMIN_NOTIFICATIONS = [
  {
    title: 'New order received',
    message: 'Order #1042 was placed by Nimal Perera — Rs 12,450.',
  },
  {
    title: 'Low stock alert',
    message: 'Handwoven Clay Pot is down to 3 units.',
  },
  {
    title: 'New customer registered',
    message: 'Anuki Silva signed up via the storefront.',
  },
  {
    title: 'Payment confirmed',
    message: 'Bank transfer for order #1038 was marked completed.',
  },
  {
    title: 'New product review',
    message: '5-star review on Batik Wall Hanging — awaiting moderation.',
  },
  {
    title: 'SMTP settings updated',
    message: 'Email delivery settings were saved successfully.',
  },
];

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

  async removeSeedNotifications() {
    if (!SEED_ADMIN_NOTIFICATIONS.length) return 0;

    const result = await AdminNotification.deleteMany({
      $or: SEED_ADMIN_NOTIFICATIONS.map(({ title, message }) => ({
        title,
        message,
      })),
    });

    return result.deletedCount || 0;
  }

  async list() {
    await this.removeSeedNotifications();
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

  async remove(id) {
    const deleted = await AdminNotification.findByIdAndDelete(id);
    if (!deleted) return null;
    return this.mapNotification(deleted);
  }

  async create({ type, title, message, link }) {
    const doc = await AdminNotification.create({
      type,
      title,
      message,
      link,
      read: false,
    });
    return this.mapNotification(doc);
  }

  async notifyNewReview({ productName, customerRating }) {
    const stars = Math.round(Number(customerRating) || 0);
    const safeProductName = String(productName || '').trim() || 'a product';
    const notification = await this.create({
      type: 'review',
      title: 'New product review',
      message: `${stars}-star review submitted for ${safeProductName} — awaiting moderation.`,
      link: '/dashboard/reviews',
    });
    const unreadCount = await this.countUnread();
    emitAdminNotification({ notification, unreadCount });
    return notification;
  }

  formatOrderAmount(amount) {
    const value = Number.parseFloat(String(amount ?? 0).replace(/,/g, ''));
    if (!Number.isFinite(value)) return 'Rs 0';
    return `Rs ${value.toLocaleString('en-LK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }

  async notifyNewOrder(order) {
    if (!order) return null;

    const orderNumber = order.orderNumber || `#${String(order._id || order.id || '').slice(-6)}`;
    const customerName = String(order.name || order.email || 'Customer').trim() || 'Customer';
    const amountLabel = this.formatOrderAmount(order.amount);

    const notification = await this.create({
      type: 'order',
      title: 'New order received',
      message: `${orderNumber} placed by ${customerName} — ${amountLabel}.`,
      link: '/dashboard/orders',
    });

    const unreadCount = await this.countUnread();
    emitAdminNotification({
      notification,
      unreadCount,
      event: 'order:placed',
      order: {
        id: String(order._id || order.id || ''),
        orderNumber,
        customerName,
        amount: Number.parseFloat(String(order.amount ?? 0).replace(/,/g, '')) || 0,
        paymentStatus: order.paymentStatus || 'pending',
        status: order.status || 'placed',
      },
    });

    return notification;
  }
}

module.exports = new AdminNotificationsService();
