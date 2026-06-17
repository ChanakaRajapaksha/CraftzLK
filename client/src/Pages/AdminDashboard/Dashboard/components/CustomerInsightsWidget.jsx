import { FaUserPlus, FaUserCheck } from "react-icons/fa";

export default function CustomerInsightsWidget({ customerSummary }) {
  return (
    <section className="admin-dash__widget admin-dash__widget--customers">
      <div className="admin-dash__widget-head">
        <h2 className="admin-dash__widget-title">Customer Growth</h2>
      </div>

      <div className="admin-dash__customer-total">
        <span className="admin-dash__customer-total-value">{customerSummary.totalCustomers.toLocaleString()}</span>
        <span className="admin-dash__customer-total-label">Customers</span>
      </div>

      <div className="admin-dash__customer-metrics">
        <div className="admin-dash__customer-metric">
          <div className="admin-dash__customer-metric-icon admin-dash__customer-metric-icon--new">
            <FaUserPlus />
          </div>
          <div>
            <p className="admin-dash__customer-metric-label">New Customers</p>
            <p className="admin-dash__customer-metric-value">+{customerSummary.newCustomers}</p>
          </div>
        </div>

        <div className="admin-dash__customer-metric">
          <div className="admin-dash__customer-metric-icon admin-dash__customer-metric-icon--returning">
            <FaUserCheck />
          </div>
          <div>
            <p className="admin-dash__customer-metric-label">Returning Rate</p>
            <p className="admin-dash__customer-metric-value">{Math.round(customerSummary.returningRate)}%</p>
          </div>
        </div>
      </div>
    </section>
  );
}
