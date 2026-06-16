import StatCard from "../../../../Components/AdminDashboard/StatCard";

export default function MetricWidgetGrid({ title, subtitle, widgets }) {
  if (!widgets?.length) return null;

  return (
    <section className="admin-dash__widget-section">
      <div className="admin-dash__widget-section-head">
        <h2 className="admin-dash__widget-section-title">{title}</h2>
        {subtitle && <p className="admin-dash__widget-section-sub">{subtitle}</p>}
      </div>
      <div className="admin-dash__widget-grid">
        {widgets.map((w) => (
          <StatCard
            key={w.label}
            icon={w.icon}
            label={w.label}
            value={w.value}
            gradient={w.gradient}
            compact={w.compact}
            trend={w.trend}
          />
        ))}
      </div>
    </section>
  );
}
