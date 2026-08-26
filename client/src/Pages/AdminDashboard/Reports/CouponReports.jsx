import { useState } from "react";
import { MdLocalOffer, MdCheckCircle, MdEventBusy, MdPayments } from "react-icons/md";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import ReportExportButtons from "./ReportExportButtons";
import ReportFilters from "./ReportFilters";
import { CouponUsageChart } from "./ReportCharts";
import useReportData from "./useReportData";
import { formatCurrency } from "./reportUtils";

function formatDiscount(row) {
  if (row.discountType === "fixed") return formatCurrency(row.discountValue);
  return `${Number(row.discountValue || 0)}%`;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CouponReports() {
  const [datePreset, setDatePreset] = useState("thisMonth");
  const [appliedDatePreset, setAppliedDatePreset] = useState("thisMonth");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const { data, loading, loadError } = useReportData("coupons", {
    preset: appliedDatePreset,
    customStart,
    customEnd,
  });

  const metrics = data?.metrics || {
    totalCoupons: 0,
    activeCoupons: 0,
    expiredCoupons: 0,
    ordersWithCoupon: 0,
    totalDiscountAmount: 0,
    avgDiscount: 0,
  };
  const coupons = data?.coupons || [];
  const topCoupons = data?.topCoupons || [];

  return (
    <>
      <AdminPageHeader
        title="Coupon Report"
        subtitle="Coupon usage, discount amounts, and active or expired coupons."
        breadcrumbs={[{ label: "Reports" }, { label: "Coupon Report" }]}
        action={
          <ReportExportButtons
            reportType="coupons"
            disabled={loading}
            filters={{
              preset: appliedDatePreset,
              customStart,
              customEnd,
            }}
          />
        }
      />

      <div className="admin-dash__report-page">
        <section className="admin-dash__panel admin-dash__report-shell">
          {loadError && (
            <p className="admin-dash__sample-banner admin-dash__sample-banner--report">
              Could not load report data. Check your connection and try again.
            </p>
          )}
          <ReportFilters
            datePreset={datePreset}
            onDatePresetChange={setDatePreset}
            customStart={customStart}
            customEnd={customEnd}
            onCustomChange={({ start, end }) => {
              setCustomStart(start || "");
              setCustomEnd(end || "");
            }}
            onDateApply={setAppliedDatePreset}
            showCategory={false}
            showProduct={false}
          />
        </section>

        {loading ? (
          <p className="admin-dash__report-loading">Loading report data…</p>
        ) : (
          <>
            <div className="admin-dash__stats admin-dash__stats--report">
              <StatCard icon={<MdLocalOffer />} label="Total coupons" value={metrics.totalCoupons} />
              <StatCard
                icon={<MdCheckCircle />}
                label="Active coupons"
                value={metrics.activeCoupons}
                gradient={["#5a7a5e", "#7a9a7e"]}
              />
              <StatCard
                icon={<MdEventBusy />}
                label="Expired coupons"
                value={metrics.expiredCoupons}
                gradient={["#8b6f47", "#d4a574"]}
              />
              <StatCard
                icon={<MdPayments />}
                label="Discount given"
                value={formatCurrency(metrics.totalDiscountAmount)}
                gradient={["#8b6f47", "#b8860b"]}
              />
            </div>

            <CouponUsageChart data={data?.usageSeries || []} />

            {topCoupons.length > 0 && (
              <section className="admin-dash__panel admin-dash__report-table-panel">
                <div className="admin-dash__panel-head">
                  <div>
                    <h2 className="admin-dash__panel-title">Top coupons in period</h2>
                    <p className="admin-dash__panel-desc">Most used coupons and discount impact</p>
                  </div>
                </div>
                <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
                  <table className="admin-dash__table admin-dash__table--modern admin-dash__table--reports">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Uses</th>
                        <th>Discount amount</th>
                        <th>Order amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCoupons.map((row) => (
                        <tr key={row.id || row.code}>
                          <td>
                            <strong>{row.code}</strong>
                          </td>
                          <td>{row.periodUsageCount}</td>
                          <td>{formatCurrency(row.periodDiscountAmount)}</td>
                          <td>{formatCurrency(row.periodOrderAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <section className="admin-dash__panel admin-dash__report-table-panel">
              <div className="admin-dash__panel-head">
                <div>
                  <h2 className="admin-dash__panel-title">All coupons</h2>
                  <p className="admin-dash__panel-desc">Catalog status with period usage</p>
                </div>
              </div>
              {coupons.length ? (
                <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
                  <table className="admin-dash__table admin-dash__table--modern admin-dash__table--reports">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Discount</th>
                        <th>Status</th>
                        <th>Period uses</th>
                        <th>Period discount</th>
                        <th>Expiry</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((row) => (
                        <tr key={row.id || row.code}>
                          <td>
                            <strong>{row.code}</strong>
                          </td>
                          <td>{formatDiscount(row)}</td>
                          <td>
                            <span
                              className={`admin-dash__status-badge admin-dash__status-badge--${
                                row.status === "active"
                                  ? "completed"
                                  : row.status === "expired"
                                    ? "cancelled"
                                    : "pending"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td>{row.periodUsageCount}</td>
                          <td>{formatCurrency(row.periodDiscountAmount)}</td>
                          <td>{formatDate(row.expiryDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="admin-dash__widget-empty">No coupon details available</p>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
