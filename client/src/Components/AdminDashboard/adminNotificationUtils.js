export const ADMIN_NOTIFICATION_ICONS = {
  order: "order",
  stock: "stock",
  customer: "customer",
  payment: "payment",
  review: "review",
  system: "system",
};

export function getAdminNotificationSample() {
  const now = Date.now();
  return {
    notificationList: [
      {
        id: "sample-1",
        type: "order",
        title: "New order received",
        message: "Order #1042 was placed by Nimal Perera — Rs 12,450.",
        link: "/dashboard/orders",
        read: false,
        createdAt: new Date(now - 12 * 60 * 1000).toISOString(),
      },
      {
        id: "sample-2",
        type: "stock",
        title: "Low stock alert",
        message: "Handwoven Clay Pot is down to 3 units.",
        link: "/dashboard/inventory/stock",
        read: false,
        createdAt: new Date(now - 45 * 60 * 1000).toISOString(),
      },
      {
        id: "sample-3",
        type: "customer",
        title: "New customer registered",
        message: "Anuki Silva signed up via the storefront.",
        link: "/dashboard/customers",
        read: false,
        createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "sample-4",
        type: "payment",
        title: "Payment confirmed",
        message: "Bank transfer for order #1038 was marked completed.",
        link: "/dashboard/payments/transactions",
        read: true,
        createdAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "sample-5",
        type: "review",
        title: "New product review",
        message: "5-star review on Batik Wall Hanging — awaiting moderation.",
        link: "/dashboard/reviews",
        read: true,
        createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    unreadCount: 3,
  };
}

export function formatNotificationTime(isoDate) {
  if (!isoDate) return "Just now";
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
