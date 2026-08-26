import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartTooltipStyle } from "../../../../Components/AdminDashboard/useChartTooltipStyle";

export default function CategoryPerformanceWidget({ categories }) {
  const { tooltipStyle, axisTick, axisTickSm } = useChartTooltipStyle();
  if (!categories?.length) {
    return (
      <section className="admin-dash__widget">
        <h2 className="admin-dash__widget-title">Top Categories</h2>
        <p className="admin-dash__widget-empty">No category details available</p>
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
            <XAxis dataKey="name" tick={axisTickSm} interval={0} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={axisTick} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "Units"]} />
            <Bar dataKey="value" fill="#8b6f47" radius={[8, 8, 0, 0]} name="Units" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
