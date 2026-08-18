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

export function normalizeAdminNotification(item) {
  if (!item) return null;
  const id = item.id || item._id;
  if (!id) return null;

  return {
    id: String(id),
    type: item.type || "system",
    title: item.title || "Notification",
    message: item.message || "",
    link: item.link || "",
    read: Boolean(item.read),
    createdAt: item.createdAt || new Date().toISOString(),
  };
}
