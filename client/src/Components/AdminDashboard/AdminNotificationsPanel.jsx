import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MdInventory,
  MdNotificationsNone,
  MdOutlinePayments,
  MdOutlineRateReview,
  MdPersonAdd,
  MdShoppingCart,
  MdSettings,
} from "react-icons/md";
import { deleteData, editData, fetchDataFromApi } from "../../utils/api";
import {
  connectAdminNotificationSocket,
  subscribeAdminNotifications,
} from "../../utils/adminNotificationSocket";
import { formatNotificationTime, normalizeAdminNotification } from "./adminNotificationUtils";

const TYPE_ICONS = {
  order: MdShoppingCart,
  stock: MdInventory,
  customer: MdPersonAdd,
  payment: MdOutlinePayments,
  review: MdOutlineRateReview,
  system: MdSettings,
};

export default function AdminNotificationsPanel({ open, onClose, onUnreadChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const syncUnreadCount = useCallback(
    (list) => {
      onUnreadChange?.(list.filter((entry) => !entry.read).length);
    },
    [onUnreadChange]
  );

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchDataFromApi("/api/admin-notifications");
      if (res?.notificationList) {
        const list = res.notificationList
          .map(normalizeAdminNotification)
          .filter(Boolean);
        setNotifications(list);
        onUnreadChange?.(
          typeof res.unreadCount === "number"
            ? res.unreadCount
            : list.filter((entry) => !entry.read).length
        );
      } else {
        setNotifications([]);
        onUnreadChange?.(0);
      }
    } catch {
      setNotifications([]);
      onUnreadChange?.(0);
    } finally {
      setLoading(false);
    }
  }, [onUnreadChange]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (open) loadNotifications();
  }, [open, loadNotifications]);

  useEffect(() => {
    let cancelled = false;

    connectAdminNotificationSocket().catch(() => {});

    const unsubscribe = subscribeAdminNotifications((payload) => {
      if (cancelled) return;

      const incoming = normalizeAdminNotification(payload?.notification);
      if (!incoming) return;

      setNotifications((prev) => {
        const withoutDuplicate = prev.filter((entry) => entry.id !== incoming.id);
        const next = [incoming, ...withoutDuplicate];
        syncUnreadCount(next);
        return next;
      });

      if (typeof payload?.unreadCount === "number") {
        onUnreadChange?.(payload.unreadCount);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [onUnreadChange, syncUnreadCount]);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointer = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((entry) => ({ ...entry, read: true })));
    onUnreadChange?.(0);

    try {
      const res = await editData("/api/admin-notifications/read-all", {});
      if (typeof res?.unreadCount === "number") onUnreadChange?.(res.unreadCount);
    } catch {
      /* keep optimistic UI */
    }
  };

  const openNotification = async (item) => {
    const targetLink = item.link || "/dashboard/reviews";

    setNotifications((prev) => {
      const next = prev.filter((entry) => entry.id !== item.id);
      syncUnreadCount(next);
      return next;
    });

    onClose?.();
    navigate(targetLink);

    try {
      const res = await deleteData(`/api/admin-notifications/${item.id}`);
      if (typeof res?.unreadCount === "number") {
        onUnreadChange?.(res.unreadCount);
      }
    } catch {
      /* notification already removed from UI */
    }
  };

  if (!open) return null;

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className="admin-dash__notif-panel" ref={panelRef} role="dialog" aria-label="Notifications">
      <div className="admin-dash__notif-panel-head">
        <div>
          <h2 className="admin-dash__notif-panel-title">Notifications</h2>
          <p className="admin-dash__notif-panel-sub">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button type="button" className="admin-dash__notif-mark-all" onClick={markAllRead}>
            Mark all read
          </button>
        )}
      </div>

      <div className="admin-dash__notif-list">
        {loading ? (
          <p className="admin-dash__notif-empty">Loading notifications…</p>
        ) : notifications.length === 0 ? (
          <div className="admin-dash__notif-empty-state">
            <MdNotificationsNone aria-hidden />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((item) => {
            const Icon = TYPE_ICONS[item.type] || MdNotificationsNone;
            return (
              <button
                key={item.id}
                type="button"
                className={`admin-dash__notif-item${item.read ? "" : " admin-dash__notif-item--unread"}`}
                onClick={() => openNotification(item)}
              >
                <span className={`admin-dash__notif-icon admin-dash__notif-icon--${item.type}`}>
                  <Icon aria-hidden />
                </span>
                <span className="admin-dash__notif-body">
                  <span className="admin-dash__notif-title">{item.title}</span>
                  <span className="admin-dash__notif-message">{item.message}</span>
                  <span className="admin-dash__notif-time">{formatNotificationTime(item.createdAt)}</span>
                </span>
                {!item.read && <span className="admin-dash__notif-dot" aria-hidden />}
              </button>
            );
          })
        )}
      </div>

      <div className="admin-dash__notif-panel-foot">
        <Link to="/dashboard/notifications" className="admin-dash__notif-manage" onClick={onClose}>
          Manage notification settings
        </Link>
      </div>
    </div>
  );
}
