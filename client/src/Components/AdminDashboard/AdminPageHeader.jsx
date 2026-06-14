import { Link } from "react-router-dom";
import { ADMIN_BASE } from "./adminNav";

export default function AdminPageHeader({
  eyebrow = "Admin",
  title,
  subtitle,
  breadcrumbs = [],
  action,
}) {
  return (
    <div className="admin-dash__page-header">
      <div>
        <p className="admin-dash__eyebrow">{eyebrow}</p>
        <h1 className="admin-dash__title">{title}</h1>
        {subtitle && <p className="admin-dash__subtitle">{subtitle}</p>}
        {breadcrumbs.length > 0 && (
          <nav className="admin-dash__breadcrumbs" aria-label="Breadcrumb">
            <Link to={ADMIN_BASE}>Dashboard</Link>
            {breadcrumbs.map((crumb, i) => (
              <span key={i}>
                <span aria-hidden="true"> / </span>
                {crumb.to ? (
                  <Link to={crumb.to}>{crumb.label}</Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
