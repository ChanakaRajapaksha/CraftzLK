import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaExclamationTriangle, FaPlus, FaSlidersH } from "react-icons/fa";
import { MdInventory, MdRemoveShoppingCart } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import AdminPagination from "../../../Components/AdminDashboard/AdminPagination";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import InventoryController from "../../../controllers/inventory.controller.js";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import {
  getStockLevelBadgeClass,
  getStockLevelLabel,
  getStockPillClass,
  STOCK_FILTERS,
} from "./stockUtils";
import { getStockListStats } from "./stockListUtils";

export default function StockList() {
  const [stockList, setStockList] = useState([]);
  const [stats, setStats] = useState({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0 });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadStock = () => {
    InventoryController.getStock()
      .then((res) => {
        const list = res?.stockList || [];
        setStockList(list);
        setStats(res?.stats || getStockListStats(list));
      })
      .catch(() => {
        setStockList([]);
        setStats({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0 });
      });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadStock();
  }, []);

  const filtered = useMemo(() => {
    let list = [...stockList];

    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      list = list.filter((item) =>
        [item.name, item.sku, item.catName].some((v) => String(v || "").toLowerCase().includes(q))
      );
    }

    if (stockFilter !== "all") {
      list = list.filter((item) => item.stockLevel === stockFilter);
    }

    return list;
  }, [stockList, searchKeyword, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const slice = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const lowStockItems = useMemo(
    () => stockList.filter((item) => item.stockLevel === "low_stock").slice(0, 5),
    [stockList]
  );

  const outOfStockItems = useMemo(
    () => stockList.filter((item) => item.stockLevel === "out_of_stock").slice(0, 5),
    [stockList]
  );

  return (
    <>
      <AdminPageHeader
        title="Stock Management"
        subtitle="Monitor inventory levels, low stock alerts, and out-of-stock products."
        breadcrumbs={[{ label: "Inventory Management" }, { label: "Stock List" }]}
        action={
          <Link to={`${ADMIN_BASE}/inventory/adjust`} className="admin-dash__btn">
            <FaSlidersH />
            Stock Adjustment
          </Link>
        }
      />

      <div className="admin-dash__stats">
        <StatCard icon={<MdInventory />} label="Total products" value={stats.total} />
        <StatCard icon={<IoShieldCheckmarkSharp />} label="In stock" value={stats.inStock} gradient={["#5a7a5e", "#7a9a7e"]} />
        <StatCard icon={<FaExclamationTriangle />} label="Low stock" value={stats.lowStock} gradient={["#a67c52", "#c9a961"]} />
        <StatCard icon={<MdRemoveShoppingCart />} label="Out of stock" value={stats.outOfStock} gradient={["#8b5344", "#a89070"]} />
      </div>

      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="admin-dash__inventory-alerts">
          {lowStockItems.length > 0 && (
            <section className="admin-dash__inventory-alert-panel">
              <h3 className="admin-dash__inventory-alert-title">
                <FaExclamationTriangle /> Low stock alert
              </h3>
              <ul className="admin-dash__inventory-alert-list">
                {lowStockItems.map((item) => (
                  <li key={item.id || item._id}>
                    <strong>{item.name}</strong>
                    <span>{item.countInStock} left (min {item.minStockAlert})</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {outOfStockItems.length > 0 && (
            <section className="admin-dash__inventory-alert-panel admin-dash__inventory-alert-panel--danger">
              <h3 className="admin-dash__inventory-alert-title">
                <MdRemoveShoppingCart /> Out of stock
              </h3>
              <ul className="admin-dash__inventory-alert-list">
                {outOfStockItems.map((item) => (
                  <li key={item.id || item._id}>
                    <strong>{item.name}</strong>
                    <span>Restock required</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <section className="admin-dash__panel">
        <div className="admin-dash__toolbar admin-dash__toolbar--wrap admin-dash__toolbar--filters">
          <input
            className="admin-dash__input"
            style={{ maxWidth: "14rem" }}
            placeholder="Search products…"
            aria-label="Search stock"
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setPage(0);
            }}
          />
          <select
            className="admin-dash__select"
            style={{ maxWidth: "12rem" }}
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value);
              setPage(0);
            }}
            aria-label="Filter by stock level"
          >
            {STOCK_FILTERS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
          <Link
            to={`${ADMIN_BASE}/inventory/adjust`}
            className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
          >
            <FaPlus />
            Adjust stock
          </Link>
        </div>

        <div className="admin-dash__data-table">
          <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
            <table className="admin-dash__table admin-dash__table--modern admin-dash__table--stock">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Min alert</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slice.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="admin-dash__table-empty">
                      No products match your filters.
                    </td>
                  </tr>
                ) : (
                  slice.map((item) => {
                    const id = item._id || item.id;
                    return (
                      <tr key={id}>
                        <td>
                          <div className="admin-dash__stock-product-cell">
                            {item.images?.[0] ? (
                              <img src={item.images[0]} alt="" className="admin-dash__table-thumb" />
                            ) : (
                              <div className="admin-dash__product-placeholder admin-dash__table-thumb" />
                            )}
                            <strong>{item.name}</strong>
                          </div>
                        </td>
                        <td>{item.sku || "—"}</td>
                        <td>{item.catName || "—"}</td>
                        <td>
                          <span className={`admin-dash__stock-pill${getStockPillClass(item)}`}>
                            {item.countInStock ?? 0}
                          </span>
                        </td>
                        <td>{item.minStockAlert ?? 5}</td>
                        <td>
                          <span
                            className={`admin-dash__status-badge admin-dash__status-badge--${getStockLevelBadgeClass(item.stockLevel)}`}
                          >
                            {getStockLevelLabel(item.stockLevel)}
                          </span>
                        </td>
                        <td>
                          <Link
                            to={`${ADMIN_BASE}/inventory/adjust?productId=${id}`}
                            className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                            title="Adjust stock"
                          >
                            <FaSlidersH />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            itemLabel="products"
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10, 25, 50]}
            onPageChange={setPage}
            onRowsPerPageChange={(value) => {
              setRowsPerPage(value);
              setPage(0);
            }}
          />
        </div>
      </section>
    </>
  );
}
