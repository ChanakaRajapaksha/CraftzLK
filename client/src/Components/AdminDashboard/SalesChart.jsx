import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function SalesChart({ data, type = "bar" }) {
  if (!data?.length) {
    return (
      <div className="admin-dash__chart" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#9a8b78" }}>
        No sales data available yet
      </div>
    );
  }

  return (
    <div className="admin-dash__chart">
      <ResponsiveContainer width="100%" height={360}>
        {type === "line" ? (
          <LineChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,169,97,0.25)" />
            <XAxis dataKey="name" tick={{ fill: "#5c4d3a", fontSize: 12 }} />
            <YAxis tick={{ fill: "#5c4d3a", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "rgba(255,253,247,0.95)",
                border: "1px solid rgba(201,169,97,0.4)",
                borderRadius: 10,
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#b8860b" strokeWidth={2} dot={{ fill: "#c9a961" }} />
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,169,97,0.25)" />
            <XAxis dataKey="name" tick={{ fill: "#5c4d3a", fontSize: 12 }} />
            <YAxis tick={{ fill: "#5c4d3a", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "rgba(255,253,247,0.95)",
                border: "1px solid rgba(201,169,97,0.4)",
                borderRadius: 10,
              }}
            />
            <Legend />
            <Bar dataKey="sales" fill="#c9a961" radius={[6, 6, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
