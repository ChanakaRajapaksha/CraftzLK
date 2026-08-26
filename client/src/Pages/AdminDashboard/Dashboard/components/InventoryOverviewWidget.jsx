import { Link } from "react-router-dom";
import { ADMIN_BASE } from "../../../../Components/AdminDashboard/adminNav";

export default function InventoryOverviewWidget({ productSummary }) {
  const { total, available, lowStock, outOfStock } = productSummary;
  const healthy = available + lowStock + outOfStock;
  const availablePct = healthy ? Math.round((available / healthy) * 100) : 0;
  const lowPct = healthy ? Math.round((lowStock / healthy) * 100) : 0;
  const outPct = healthy ? Math.round((outOfStock / healthy) * 100) : 0;
  const hasData = Number(total || 0) > 0;

  return (
    <section className="admin-dash__widget admin-dash__widget--inventory">
      <div className="admin-dash__widget-head">
        <h2 className="admin-dash__widget-title">Inventory</h2>
      </div>

      {!hasData ? (
        <p className="admin-dash__widget-empty">No inventory details available</p>
      ) : (
        <>
          <div className="admin-dash__inventory-total">
            <span className="admin-dash__inventory-total-label">Total Products</span>
            <span className="admin-dash__inventory-total-value">{total}</span>
          </div>

          <div className="admin-dash__inventory-health">
            <p className="admin-dash__inventory-health-label">Stock Health</p>
            <div
              className="admin-dash__inventory-bar"
              role="img"
              aria-label={`Available ${available}, Low stock ${lowStock}, Out of stock ${outOfStock}`}
            >
              {availablePct > 0 && (
                <span
                  className="admin-dash__inventory-bar-seg admin-dash__inventory-bar-seg--available"
                  style={{ width: `${availablePct}%` }}
                />
              )}
              {lowPct > 0 && (
                <span
                  className="admin-dash__inventory-bar-seg admin-dash__inventory-bar-seg--low"
                  style={{ width: `${lowPct}%` }}
                />
              )}
              {outPct > 0 && (
                <span
                  className="admin-dash__inventory-bar-seg admin-dash__inventory-bar-seg--out"
                  style={{ width: `${outPct}%` }}
                />
              )}
            </div>
            <ul className="admin-dash__inventory-legend">
              <li>
                <span className="admin-dash__legend-dot admin-dash__legend-dot--available" />
                Available <strong>{available}</strong>
              </li>
              <li>
                <span className="admin-dash__legend-dot admin-dash__legend-dot--low" />
                Low Stock <strong>{lowStock}</strong>
              </li>
              <li>
                <span className="admin-dash__legend-dot admin-dash__legend-dot--out" />
                Out of Stock <strong>{outOfStock}</strong>
              </li>
            </ul>
          </div>

          <Link
            to={`${ADMIN_BASE}/products`}
            className="admin-dash__btn admin-dash__btn--ghost admin-dash__inventory-btn"
          >
            Manage Inventory
          </Link>
        </>
      )}
    </section>
  );
}
