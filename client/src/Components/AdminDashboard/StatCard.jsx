export default function StatCard({ icon, label, value, gradient = ["#8b6f47", "#b8860b"] }) {
  return (
    <div className="admin-dash__stat">
      <div
        className="admin-dash__stat-icon"
        style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}
      >
        {icon}
      </div>
      <div>
        <p className="admin-dash__stat-label">{label}</p>
        <p className="admin-dash__stat-value">{value ?? 0}</p>
      </div>
    </div>
  );
}
