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
import { editData, fetchDataFromApi } from "../../utils/api";
import { formatNotificationTime, getAdminNotificationSample } from "./adminNotificationUtils";

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
  const [usingSample, setUsingSample] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchDataFromApi("/api/admin-notifications");
      if (res?.notificationList) {
        setNotifications(res.notificationList);
        setUsingSample(false);
        onUnreadChange?.(res.unreadCount ?? 0);
      } else {
        const sample = getAdminNotificationSample();
        setNotifications(sample.notificationList);
        setUsingSample(true);
        onUnreadChange?.(sample.unreadCount);
      }
    } catch {
      const sample = getAdminNotificationSample();
      setNotifications(sample.notificationList);
      setUsingSample(true);
      onUnreadChange?.(sample.unreadCount);
    } finally {
      setLoading(false);
    }
  }, [onUnreadChange]);

  useEffect(() => {
    if (open) loadNotifications();
  }, [open, loadNotifications]);

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

  const markRead = async (item) => {
    if (item.read) return;
    setNotifications((prev) => {
      const next = prev.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry));
      onUnreadChange?.(next.filter((entry) => !entry.read).length);
      return next;
    });

    if (usingSample || String(item.id).startsWith("sample-")) return;

    try {
      const res = await editData(`/api/admin-notifications/${item.id}/read`, {});
      if (typeof res?.unreadCount === "number") onUnreadChange?.(res.unreadCount);
    } catch {
      /* keep optimistic UI */
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((entry) => ({ ...entry, read: true })));
    onUnreadChange?.(0);

    if (usingSample) return;

    try {
      const res = await editData("/api/admin-notifications/read-all", {});
      if (typeof res?.unreadCount === "number") onUnreadChange?.(res.unreadCount);
    } catch {
      /* keep optimistic UI */
    }
  };

  const openNotification = async (item) => {
    await markRead(item);
    onClose?.();
    if (item.link) navigate(item.link);
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

      {usingSample && (
        <p className="admin-dash__notif-sample">Showing sample notifications</p>
      )}

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
