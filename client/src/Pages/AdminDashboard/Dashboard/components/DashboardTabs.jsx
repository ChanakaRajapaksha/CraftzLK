const TABS = [
  { id: "home", label: "Dashboard Home" },
  { id: "sales", label: "Sales Analytics" },
  { id: "performance", label: "Store Performance" },
];

export default function DashboardTabs({ active, onChange }) {
  return (
    <nav className="admin-dash__tabs" aria-label="Dashboard sections">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`admin-dash__tab${active === tab.id ? " admin-dash__tab--active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
