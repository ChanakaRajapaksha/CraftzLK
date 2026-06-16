import { IoBagCheckOutline, IoPersonOutline, IoStarOutline, IoCubeOutline } from "react-icons/io5";

const ICONS = {
  order: IoBagCheckOutline,
  customer: IoPersonOutline,
  product: IoCubeOutline,
  review: IoStarOutline,
};

function formatTime(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

export default function RecentActivityFeed({ activities }) {
  return (
    <section className="admin-dash__panel admin-dash__activity-panel">
      <div className="admin-dash__panel-head">
        <div>
          <h2 className="admin-dash__panel-title">Recent Activity</h2>
          <p className="admin-dash__panel-desc">Latest store events</p>
        </div>
      </div>
      <ul className="admin-dash__activity-list">
        {(activities?.length ? activities : [{ title: "No recent activity", detail: "Activity will appear here", type: "order" }]).map(
          (item, i) => {
            const Icon = ICONS[item.type] || IoBagCheckOutline;
            return (
              <li key={item.id || i} className={`admin-dash__activity-item admin-dash__activity-item--${item.type}`}>
                <span className="admin-dash__activity-icon">
                  <Icon />
                </span>
                <div className="admin-dash__activity-body">
                  <p className="admin-dash__activity-title">{item.title}</p>
                  <p className="admin-dash__activity-detail">{item.detail}</p>
                </div>
                {item.time && <time className="admin-dash__activity-time">{formatTime(item.time)}</time>}
              </li>
            );
          }
        )}
      </ul>
    </section>
  );
}
