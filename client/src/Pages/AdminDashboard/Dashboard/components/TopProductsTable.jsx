import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import Rating from "@mui/material/Rating";
import { ADMIN_BASE } from "../../../../Components/AdminDashboard/adminNav";
import { formatCurrency } from "../dashboardAnalytics";

export default function TopProductsTable({ products }) {
  if (!products?.length) {
    return (
      <section className="admin-dash__panel">
        <h2 className="admin-dash__panel-title">Product Performance</h2>
        <p className="admin-dash__widget-empty">No product details available</p>
      </section>
    );
  }

  return (
    <section className="admin-dash__panel admin-dash__table-panel">
      <div className="admin-dash__panel-head">
        <div>
          <h2 className="admin-dash__panel-title">Product Performance</h2>
          <p className="admin-dash__panel-desc">Top catalogue items at a glance</p>
        </div>
        <Link to={`${ADMIN_BASE}/products`} className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm">
          View all
        </Link>
      </div>
      <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
        <table className="admin-dash__table admin-dash__table--modern">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Rating</th>
              <th>Units sold</th>
              <th>Revenue</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="admin-dash__product-cell">
                    {item.image ? <img src={item.image} alt="" /> : <div className="admin-dash__product-placeholder" />}
                    <div>
                      <h6>{item.name}</h6>
                      {item.catName && <p>{item.catName}</p>}
                    </div>
                  </div>
                </td>
                <td>
                  <span className="admin-dash__badge">{item.catName || "—"}</span>
                </td>
                <td>
                  <span
                    className={`admin-dash__stock-pill${
                      item.stock <= 0
                        ? " admin-dash__stock-pill--out"
                        : item.stock <= 5
                          ? " admin-dash__stock-pill--low"
                          : ""
                    }`}
                  >
                    {item.stock ?? 0}
                  </span>
                </td>
                <td>
                  <strong>{formatCurrency(item.price)}</strong>
                </td>
                <td>
                  <Rating value={item.rating || 0} precision={0.5} size="small" readOnly />
                </td>
                <td>{item.qty ?? 0}</td>
                <td>{formatCurrency(item.revenue ?? 0)}</td>
                <td>
                  <Link
                    to={`${ADMIN_BASE}/product/details/${item.productId || item.id}`}
                    className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                  >
                    <FaEye />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
