import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ADMIN_BASE } from "./adminNav";
import { normalizeAdminNotification } from "./adminNotificationUtils";
import {
  connectAdminNotificationSocket,
  subscribeAdminNotifications,
} from "../../utils/adminNotificationSocket";

const TYPE_LINKS = {
  order: `${ADMIN_BASE}/orders`,
  review: `${ADMIN_BASE}/reviews`,
  payment: `${ADMIN_BASE}/payments/transactions`,
  customer: `${ADMIN_BASE}/customers`,
  stock: `${ADMIN_BASE}/products`,
};

function formatToastAmount(amount) {
  const value = Number(amount) || 0;
  return `Rs ${value.toLocaleString("en-LK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function showOrderAlert(notification, orderMeta, navigate) {
  const orderNumber = orderMeta?.orderNumber || "New order";
  const customerName = orderMeta?.customerName || "Customer";
  const amount =
    orderMeta?.amount != null
      ? formatToastAmount(orderMeta.amount)
      : notification.message?.split("—").pop()?.trim() || "";

  toast.success(notification.title || "New order received", {
    description: `${orderNumber} · ${customerName}${amount ? ` · ${amount}` : ""}`,
    duration: 8000,
    action: {
      label: "View orders",
      onClick: () => navigate(TYPE_LINKS.order),
    },
  });

  window.dispatchEvent(
    new CustomEvent("admin-dashboard:refresh", {
      detail: { reason: "order:placed", order: orderMeta },
    })
  );
}

function showGenericAlert(notification, navigate) {
  const link = notification.link || TYPE_LINKS[notification.type] || ADMIN_BASE;
  const toastFn =
    notification.type === "stock"
      ? toast.warning
      : notification.type === "payment"
        ? toast.info
        : toast;

  toastFn(notification.title, {
    description: notification.message,
    duration: 6000,
    action: {
      label: "Open",
      onClick: () => navigate(link.startsWith("/") ? link : `${ADMIN_BASE}${link}`),
    },
  });
}

export default function AdminRealtimeAlerts() {
  const navigate = useNavigate();

  useEffect(() => {
    connectAdminNotificationSocket().catch(() => {});

    const unsubscribe = subscribeAdminNotifications((payload) => {
      const notification = normalizeAdminNotification(payload?.notification);
      if (!notification) return;

      if (notification.type === "order" || payload?.event === "order:placed") {
        showOrderAlert(notification, payload?.order, navigate);
        return;
      }

      showGenericAlert(notification, navigate);
    });

    return unsubscribe;
  }, [navigate]);

  return null;
}
