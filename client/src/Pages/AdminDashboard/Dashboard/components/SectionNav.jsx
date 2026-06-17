const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "sales", label: "Sales" },
  { id: "products", label: "Products" },
  { id: "customers", label: "Customers" },
];

export default function SectionNav({ active, onChange }) {
  return (
    <nav className="admin-dash__section-nav" aria-label="Dashboard sections">
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          className={`admin-dash__section-nav-item${active === section.id ? " admin-dash__section-nav-item--active" : ""}`}
          onClick={() => onChange(section.id)}
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
}
