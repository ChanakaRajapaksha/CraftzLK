import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  background: "rgba(255,253,247,0.98)",
  border: "1px solid rgba(201,169,97,0.45)",
  borderRadius: 12,
  boxShadow: "0 8px 24px rgba(92,77,58,0.12)",
  fontFamily: "inherit",
};

export default function CategoryPerformanceWidget({ categories }) {
  if (!categories?.length) {
    return (
      <section className="admin-dash__widget">
        <h2 className="admin-dash__widget-title">Top Categories</h2>
        <p className="admin-dash__widget-empty">No category data available</p>
      </section>
    );
  }

  return (
    <section className="admin-dash__widget admin-dash__widget--categories">
      <div className="admin-dash__widget-head">
        <h2 className="admin-dash__widget-title">Top Categories</h2>
      </div>

      <ul className="admin-dash__category-list">
        {categories.map((cat) => (
          <li key={cat.name} className="admin-dash__category-item">
            <div className="admin-dash__category-item-head">
              <span>{cat.name}</span>
              <strong>{cat.percent ?? 0}%</strong>
            </div>
            <div className="admin-dash__category-bar-track">
              <span
                className="admin-dash__category-bar-fill"
                style={{ width: `${cat.percent ?? 0}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="admin-dash__category-chart">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={categories} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(201,169,97,0.2)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#5c4d3a", fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={{ fill: "#5c4d3a", fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "Units"]} />
            <Bar dataKey="value" fill="#8b6f47" radius={[8, 8, 0, 0]} name="Units" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
