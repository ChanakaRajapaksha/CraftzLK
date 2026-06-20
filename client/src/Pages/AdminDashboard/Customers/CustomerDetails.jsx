import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Rating from "@mui/material/Rating";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import {
  formatAddress,
  formatCurrency,
  formatCustomerDate,
  getCustomerStatusBadgeClass,
  normalizeCustomer,
} from "./customerUtils";
import { getSampleCustomerById, isSampleCustomerId } from "./customerListUtils";
import { getOrderStatusBadgeClass } from "../Orders/orderUtils";

function DetailItem({ label, value, children }) {
  return (
    <div className="admin-dash__detail-item">
      <dt>{label}</dt>
      <dd>{children ?? value ?? "—"}</dd>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <section className="admin-dash__panel admin-dash__customer-section">
      <h2 className="admin-dash__panel-title">{title}</h2>
      {children}
    </section>
  );
}

export default function CustomerDetails() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [tab, setTab] = useState("profile");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      if (isSampleCustomerId(id)) {
        const sample = getSampleCustomerById(id);
        if (!cancelled) {
          setCustomer(sample ? normalizeCustomer(sample) : null);
          setUsingSampleData(Boolean(sample));
          setLoading(false);
        }
        return;
      }

      const res = await fetchDataFromApi(`/api/customers/${id}`);
      if (cancelled) return;

      if (res?.customerData) {
        setCustomer(normalizeCustomer(res.customerData));
        setUsingSampleData(false);
      } else {
        setCustomer(null);
      }
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="admin-dash__product-view-loading">
        <p className="admin-dash__subtitle">Loading customer details…</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <>
        <AdminPageHeader
          title="Customer not found"
          breadcrumbs={[
            { label: "Customers", to: `${ADMIN_BASE}/customers` },
            { label: "Details" },
          ]}
        />
        <section className="admin-dash__panel admin-dash__product-view-empty">
          <p>We could not find a customer with this ID.</p>
          <Link to={`${ADMIN_BASE}/customers`} className="admin-dash__btn">
            Back to customer list
          </Link>
        </section>
      </>
    );
  }

  const profileImage = customer.images?.[0];

  return (
    <>
      <AdminPageHeader
        title={customer.name}
        subtitle={customer.email}
        breadcrumbs={[
          { label: "Customers", to: `${ADMIN_BASE}/customers` },
          { label: "Details" },
        ]}
        action={
          <Link to={`${ADMIN_BASE}/customers`} className="admin-dash__btn admin-dash__btn--ghost">
            Back to list
          </Link>
        }
      />

      {usingSampleData && (
        <p className="admin-dash__sample-banner">Showing sample customer details for preview.</p>
      )}

      <nav className="admin-dash__product-tabs" aria-label="Customer detail sections">
        {[
          { id: "profile", label: "Profile" },
          { id: "orders", label: "Orders" },
          { id: "activity", label: "Activity" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            className={`admin-dash__product-tab${tab === item.id ? " admin-dash__product-tab--active" : ""}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === "profile" && (
        <div className="admin-dash__customer-detail-grid">
          <DetailSection title="Profile">
            <div className="admin-dash__customer-profile">
              {profileImage ? (
                <img src={profileImage} alt="" className="admin-dash__customer-profile-image" />
              ) : (
                <div className="admin-dash__customer-profile-image admin-dash__product-placeholder" />
              )}
              <div className="admin-dash__customer-profile-meta">
                <h3>{customer.name}</h3>
                <span className={`admin-dash__status-badge admin-dash__status-badge--${getCustomerStatusBadgeClass(customer.status)}`}>
                  {customer.status}
                </span>
                <p>Member since {formatCustomerDate(customer.joinedAt)}</p>
              </div>
            </div>
          </DetailSection>

          <DetailSection title="Personal Details">
            <dl className="admin-dash__detail-grid">
              <DetailItem label="Full name" value={customer.name} />
              <DetailItem label="Email" value={customer.email} />
              <DetailItem label="Phone" value={customer.phone} />
              <DetailItem label="Orders" value={customer.orderCount} />
              <DetailItem label="Total spend" value={formatCurrency(customer.totalSpend)} />
            </dl>
          </DetailSection>

          <DetailSection title="Address">
            <dl className="admin-dash__detail-grid">
              <DetailItem label="Street" value={customer.address?.street || "—"} />
              <DetailItem label="City" value={customer.address?.city || "—"} />
              <DetailItem label="State" value={customer.address?.state || "—"} />
              <DetailItem label="Postal code" value={customer.address?.zipCode || "—"} />
              <DetailItem label="Country" value={customer.address?.country || "—"} />
              <DetailItem label="Full address" value={formatAddress(customer.address)} />
            </dl>
          </DetailSection>
        </div>
      )}

      {tab === "orders" && (
        <DetailSection title="Order History">
          {(customer.orders || []).length === 0 ? (
            <p className="admin-dash__panel-desc">No orders placed yet.</p>
          ) : (
            <div className="admin-dash__data-table">
              <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
                <table className="admin-dash__table admin-dash__table--modern admin-dash__table--orders">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.orders.map((order) => {
                      const orderId = order._id || order.id;
                      return (
                        <tr key={orderId}>
                          <td><strong>{order.orderNumber || `#${orderId}`}</strong></td>
                          <td>{formatCustomerDate(order.date)}</td>
                          <td><strong>{formatCurrency(order.amount)}</strong></td>
                          <td>
                            <span className={`admin-dash__status-badge admin-dash__status-badge--${getOrderStatusBadgeClass(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <Link
                              to={`${ADMIN_BASE}/orders/${orderId}`}
                              className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DetailSection>
      )}

      {tab === "activity" && (
        <div className="admin-dash__customer-detail-grid">
          <DetailSection title="Reviews">
            {(customer.reviews || []).length === 0 ? (
              <p className="admin-dash__panel-desc">No reviews submitted yet.</p>
            ) : (
              <ul className="admin-dash__customer-activity-list">
                {customer.reviews.map((review) => (
                  <li key={review._id || review.id} className="admin-dash__customer-activity-item">
                    <div className="admin-dash__customer-activity-head">
                      <Rating value={Number(review.rating) || 0} readOnly size="small" />
                      <span>{formatCustomerDate(review.date)}</span>
                    </div>
                    <p>{review.review}</p>
                  </li>
                ))}
              </ul>
            )}
          </DetailSection>

          <DetailSection title="Wishlist">
            {(customer.wishlist || []).length === 0 ? (
              <p className="admin-dash__panel-desc">Wishlist is empty.</p>
            ) : (
              <div className="admin-dash__customer-wishlist">
                {customer.wishlist.map((item) => (
                  <article key={item._id || item.id} className="admin-dash__customer-wishlist-item">
                    {item.image ? (
                      <img src={item.image} alt="" className="admin-dash__table-thumb" />
                    ) : (
                      <div className="admin-dash__product-placeholder admin-dash__table-thumb" />
                    )}
                    <div>
                      <strong>{item.productTitle}</strong>
                      <p>{formatCurrency(item.price)}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </DetailSection>
        </div>
      )}
    </>
  );
}
