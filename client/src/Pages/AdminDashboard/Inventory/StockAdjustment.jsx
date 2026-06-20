import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import { fetchDataFromApi, postData } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import {
  defaultStockAdjustmentFields,
  STOCK_ACTIONS,
  getStockPillClass,
} from "./stockUtils";
import { getStockListSampleData, isSampleStockId } from "./stockListUtils";

function Field({ label, htmlFor, children, full = false }) {
  return (
    <div className={`admin-dash__field${full ? " admin-dash__field--full" : ""}`}>
      <label className="admin-dash__label" htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

export default function StockAdjustment() {
  const { setAlertBox } = useOutletContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [recentAdjustments, setRecentAdjustments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState({ ...defaultStockAdjustmentFields });

  useEffect(() => {
    window.scrollTo(0, 0);
    const productId = searchParams.get("productId");
    if (productId) {
      setFormFields((prev) => ({ ...prev, productId }));
    }

    fetchDataFromApi("/api/inventory/stock")
      .then((res) => {
        const list = res?.stockList || [];
        if (list.length) {
          setProducts(list);
        } else {
          setProducts(getStockListSampleData());
        }
      })
      .catch(() => setProducts(getStockListSampleData()));

    fetchDataFromApi("/api/inventory/adjustments")
      .then((res) => setRecentAdjustments(res?.adjustmentList || []))
      .catch(() => setRecentAdjustments([]));
  }, [searchParams]);

  const selectedProduct = useMemo(
    () => products.find((item) => (item._id || item.id) === formFields.productId),
    [products, formFields.productId]
  );

  const changeInput = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  const submit = (e) => {
    e.preventDefault();

    if (!formFields.productId) {
      setAlertBox?.({ open: true, error: true, msg: "Select a product." });
      return;
    }
    if (!formFields.quantity || Number(formFields.quantity) < 1) {
      setAlertBox?.({ open: true, error: true, msg: "Enter a valid quantity." });
      return;
    }
    if (!formFields.reason?.trim()) {
      setAlertBox?.({ open: true, error: true, msg: "Reason is required." });
      return;
    }

    if (isSampleStockId(formFields.productId)) {
      const qty = Number(formFields.quantity);
      const current = Number(selectedProduct?.countInStock ?? 0);
      const next =
        formFields.action === "add" ? current + qty : Math.max(0, current - qty);
      setProducts((prev) =>
        prev.map((item) =>
          (item._id || item.id) === formFields.productId
            ? { ...item, countInStock: next }
            : item
        )
      );
      setAlertBox?.({ open: true, error: false, msg: "Stock adjusted (sample mode)." });
      navigate(`${ADMIN_BASE}/inventory/stock`);
      return;
    }

    setIsLoading(true);
    postData("/api/inventory/adjust", {
      productId: formFields.productId,
      action: formFields.action,
      quantity: Number(formFields.quantity),
      reason: formFields.reason,
    })
      .then(() => {
        setAlertBox?.({ open: true, error: false, msg: "Stock adjusted successfully." });
        navigate(`${ADMIN_BASE}/inventory/stock`);
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to adjust stock." });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <AdminPageHeader
        title="Stock Adjustment"
        subtitle="Add or remove stock with a recorded reason."
        breadcrumbs={[
          { label: "Inventory Management", to: `${ADMIN_BASE}/inventory/stock` },
          { label: "Stock Adjustment" },
        ]}
      />

      <form className="admin-dash__product-form" onSubmit={submit}>
        <section className="admin-dash__panel admin-dash__product-panel">
          <div className="admin-dash__form-grid admin-dash__form-grid--2 admin-dash__stock-adjust-form">
            <Field label="Product" htmlFor="productId" full>
              <select
                className="admin-dash__select"
                id="productId"
                name="productId"
                value={formFields.productId}
                onChange={changeInput}
              >
                <option value="">Select product</option>
                {products.map((product) => {
                  const id = product._id || product.id;
                  return (
                    <option key={id} value={id}>
                      {product.name} — {product.countInStock ?? 0} in stock
                    </option>
                  );
                })}
              </select>
            </Field>

            {selectedProduct && (
              <Field label="Current quantity" full>
                <div
                  className="admin-dash__inventory-current-stock admin-dash__inventory-current-stock--boxed"
                  aria-label="Current quantity"
                >
                  <span className={`admin-dash__stock-pill${getStockPillClass(selectedProduct)}`}>
                    {selectedProduct.countInStock ?? 0}
                  </span>
                  <span className="admin-dash__hint">Min alert: {selectedProduct.minStockAlert ?? 5}</span>
                </div>
              </Field>
            )}

            <Field label="Action" htmlFor="action">
              <select
                className="admin-dash__select"
                id="action"
                name="action"
                value={formFields.action}
                onChange={changeInput}
              >
                {STOCK_ACTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Quantity" htmlFor="quantity">
              <input
                className="admin-dash__input"
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={formFields.quantity}
                onChange={changeInput}
                placeholder="e.g. 10"
              />
            </Field>

            <Field label="Reason" htmlFor="reason" full>
              <textarea
                className="admin-dash__textarea"
                id="reason"
                name="reason"
                rows={3}
                value={formFields.reason}
                onChange={changeInput}
                placeholder="e.g. Restock from supplier, damaged items removed, inventory count correction…"
              />
            </Field>
          </div>

          <div className="admin-dash__product-form-actions">
            <Link to={`${ADMIN_BASE}/inventory/stock`} className="admin-dash__btn admin-dash__btn--ghost">
              Cancel
            </Link>
            <button type="submit" className="admin-dash__btn" disabled={isLoading}>
              {isLoading ? "Saving…" : "Apply adjustment"}
            </button>
          </div>
        </section>
      </form>

      {recentAdjustments.length > 0 && (
        <section className="admin-dash__panel">
          <h3 className="admin-dash__panel-subtitle">Recent adjustments</h3>
          <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
            <table className="admin-dash__table admin-dash__table--modern admin-dash__table--stock">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Action</th>
                  <th>Qty</th>
                  <th>Before</th>
                  <th>After</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {recentAdjustments.slice(0, 8).map((item) => (
                  <tr key={item._id || item.id}>
                    <td>{item.productName}</td>
                    <td>{item.action === "add" ? "Add Stock" : "Remove Stock"}</td>
                    <td>{item.quantity}</td>
                    <td>{item.previousStock}</td>
                    <td>{item.newStock}</td>
                    <td className="admin-dash__review-comment" title={item.reason}>{item.reason || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
