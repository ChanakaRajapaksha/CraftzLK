export default function PaymentOverviewWidget({ metrics }) {
  const items = [
    {
      label: "Delivered & paid",
      value: metrics.completedOrderCount ?? 0,
      accent: "completed",
    },
    {
      label: "Pending payment",
      value: metrics.pendingPaymentCount ?? 0,
      accent: "pending",
    },
    {
      label: "Failed payments",
      value: metrics.failedPaymentCount ?? 0,
      accent: "failed",
    },
    {
      label: "Refunded",
      value: metrics.refundedPaymentCount ?? 0,
      accent: "refunded",
    },
  ];

  return (
    <section className="admin-dash__widget admin-dash__widget--payment-overview">
      <div className="admin-dash__widget-head">
        <h2 className="admin-dash__widget-title">Payment Overview</h2>
        <p className="admin-dash__widget-desc">Orders in the selected period</p>
      </div>
      <div className="admin-dash__sales-overview-grid">
        {items.map((item) => (
          <div
            key={item.label}
            className={`admin-dash__sales-metric admin-dash__sales-metric--${item.accent}`}
          >
            <span className="admin-dash__sales-metric-label">{item.label}</span>
            <span className="admin-dash__sales-metric-value">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
