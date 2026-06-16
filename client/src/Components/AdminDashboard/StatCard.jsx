export default function StatCard({
  icon,
  label,
  value,
  gradient = ["#8b6f47", "#b8860b"],
  compact = false,
  trend,
}) {
  return (
    <div className={`admin-dash__stat${compact ? " admin-dash__stat--compact" : ""}`}>
      <div
        className="admin-dash__stat-icon"
        style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}
      >
        {icon}
      </div>
      <div className="admin-dash__stat-body">
        <p className="admin-dash__stat-label">{label}</p>
        <p className="admin-dash__stat-value">{value ?? 0}</p>
        {trend && (
          <span className={`admin-dash__stat-trend admin-dash__stat-trend--${trend.direction}`}>
            {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "•"} {trend.label}
          </span>
        )}
      </div>
    </div>
  );
}
