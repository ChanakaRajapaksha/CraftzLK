import { FaExclamationTriangle } from "react-icons/fa";

export default function LowStockAlertWidget({ products, variant = "widget" }) {
  if (variant === "kpi") {
    return (
      <div className="admin-dash__kpi-card admin-dash__kpi-card--low-stock">
        <p className="admin-dash__kpi-label">Low Stock</p>
        {!products?.length ? (
          <>
            <p className="admin-dash__kpi-value">0</p>
            <p className="admin-dash__kpi-meta">All stocked</p>
          </>
        ) : (
          <>
            <p className="admin-dash__kpi-value">{products.length}</p>
            <ul className="admin-dash__kpi-low-stock-list">
              {products.slice(0, 3).map((product) => (
                <li key={product.id} className="admin-dash__kpi-low-stock-item">
                  <FaExclamationTriangle className="admin-dash__kpi-low-stock-icon" aria-hidden />
                  <span>
                    {product.name}
                    <em> ({product.remaining} left)</em>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  }

  return (
    <section className="admin-dash__widget admin-dash__widget--low-stock">
      <div className="admin-dash__widget-head">
        <h2 className="admin-dash__widget-title">Low Stock Alert</h2>
      </div>
      {!products?.length ? (
        <p className="admin-dash__widget-empty">All products are well stocked</p>
      ) : (
        <ul className="admin-dash__low-stock-list">
          {products.map((product) => (
            <li key={product.id} className="admin-dash__low-stock-item">
              <FaExclamationTriangle className="admin-dash__low-stock-icon" aria-hidden />
              <div>
                <p className="admin-dash__low-stock-name">{product.name}</p>
                <p className="admin-dash__low-stock-remaining">Remaining: {product.remaining}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
