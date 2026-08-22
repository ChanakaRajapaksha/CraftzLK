import { Link } from "react-router-dom";
import { ADMIN_BASE } from "../../../../Components/AdminDashboard/adminNav";
import { formatCurrency, getStatusBadgeClass } from "../dashboardAnalytics";

export default function RecentOrdersTable({ orders }) {
  if (!orders?.length) {
    return (
      <section className="admin-dash__widget">
        <h2 className="admin-dash__widget-title">Recent Orders</h2>
        <p className="admin-dash__widget-empty">No orders in this period</p>
      </section>
    );
  }

  return (
    <section className="admin-dash__widget admin-dash__widget--recent-orders">
      <div className="admin-dash__widget-head">
        <h2 className="admin-dash__widget-title">Recent Orders</h2>
        <Link to={`${ADMIN_BASE}/orders`} className="admin-dash__widget-link">
          View All
        </Link>
      </div>

      <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
        <table className="admin-dash__table admin-dash__table--modern admin-dash__table--compact">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <strong>{order.orderNumber}</strong>
                </td>
                <td>{order.customer}</td>
                <td>{formatCurrency(order.amount)}</td>
                <td>
                  <span className={`admin-dash__status-badge admin-dash__status-badge--${getStatusBadgeClass(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  {order.paymentStatus && (
                    <span className={`admin-dash__status-badge admin-dash__status-badge--${getStatusBadgeClass(order.paymentStatus)} admin-dash__status-badge--inline`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  )}
                </td>
                <td>
                  <Link
                    to={`${ADMIN_BASE}/orders`}
                    className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                  >
                    View Order
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
