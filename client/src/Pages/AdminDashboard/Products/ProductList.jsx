import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { FaEye, FaFileExport, FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import AdminConfirmDialog from "../../../Components/AdminDashboard/AdminConfirmDialog";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import { MdShoppingBag, MdCategory } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { deleteData, fetchDataFromApi, postData } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import { getProductListSampleData, isSampleProductId } from "./productListSampleData";
import PriceRangeFilter, { getProductPriceBounds } from "../../../Components/AdminDashboard/PriceRangeFilter";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-LK", { year: "numeric", month: "short", day: "numeric" });
}

function exportCsv(products) {
  const headers = ["Name", "SKU", "Category", "Price", "Stock", "Status", "Featured", "Created"];
  const rows = products.map((p) => [
    p.name,
    p.sku || "",
    p.catName || "",
    p.price,
    p.countInStock,
    p.status || "active",
    p.isFeatured ? "Yes" : "No",
    formatDate(p.dateCreated),
  ]);
  const csv = [headers, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `craftzlk-products-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ProductList() {
  const { catData, setAlertBox } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCategory, setTotalCategory] = useState(0);
  const [totalSubCategory, setTotalSubCategory] = useState(0);
  const [selected, setSelected] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryVal, setCategoryVal] = useState("all");
  const [priceRange, setPriceRange] = useState(null);
  const [stockFilter, setStockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const applySampleProducts = () => {
    setProducts(getProductListSampleData());
    setUsingSampleData(true);
    setTotalProducts(getProductListSampleData().length);
  };

  const loadProducts = () => {
    fetchDataFromApi("/api/products")
      .then((res) => {
        const list = res?.products || [];
        if (list.length) {
          setProducts(list);
          setUsingSampleData(false);
        } else {
          applySampleProducts();
        }
      })
      .catch(() => applySampleProducts());
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadProducts();
    fetchDataFromApi("/api/products/get/count")
      .then((res) => {
        const count = res?.productsCount ?? 0;
        if (count > 0) setTotalProducts(count);
      })
      .catch(() => {});
    fetchDataFromApi("/api/category/get/count").then((res) => setTotalCategory(res?.categoryCount ?? 0));
    fetchDataFromApi("/api/category/subCat/get/count").then((res) => setTotalSubCategory(res?.categoryCount ?? 0));
  }, []);

  const priceBounds = useMemo(() => getProductPriceBounds(products), [products]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      list = list.filter((p) =>
        [p.name, p.sku, p.catName, p.brand].some((v) => String(v || "").toLowerCase().includes(q))
      );
    }

    if (categoryVal !== "all") {
      const catName = catData?.categoryList?.find((c) => c._id === categoryVal)?.name;
      list = list.filter(
        (p) => p.catId === categoryVal || (usingSampleData && catName && p.catName === catName)
      );
    }

    if (priceRange) {
      list = list.filter(
        (p) => Number(p.price) >= priceRange[0] && Number(p.price) <= priceRange[1]
      );
    }

    if (stockFilter === "in_stock") list = list.filter((p) => Number(p.countInStock) > 0);
    if (stockFilter === "low_stock") list = list.filter((p) => Number(p.countInStock) > 0 && Number(p.countInStock) <= Number(p.minStockAlert || 5));
    if (stockFilter === "out_of_stock") list = list.filter((p) => Number(p.countInStock) <= 0);

    if (statusFilter === "active") list = list.filter((p) => (p.status || "active") === "active");
    if (statusFilter === "inactive") list = list.filter((p) => (p.status || "active") === "inactive");

    return list;
  }, [products, searchKeyword, categoryVal, priceRange, stockFilter, statusFilter, catData, usingSampleData]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const slice = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const toggleSelectAll = (checked) => {
    setSelected(checked ? slice.map((p) => p.id || p._id) : []);
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const deleteProduct = (id) => {
    if (usingSampleData || isSampleProductId(id)) {
      setProducts((prev) => prev.filter((p) => (p.id || p._id) !== id));
      setTotalProducts((n) => Math.max(0, n - 1));
      setSelected((prev) => prev.filter((x) => x !== id));
      setAlertBox?.({ open: true, error: false, msg: "Product removed from sample list." });
      return;
    }
    deleteData(`/api/products/${id}`).then(() => {
      setAlertBox?.({ open: true, error: false, msg: "Product deleted." });
      setSelected((prev) => prev.filter((x) => x !== id));
      loadProducts();
    });
  };

  const requestDeleteProduct = (item) => {
    setDeleteTarget({ id: item.id || item._id, name: item.name });
  };

  const confirmDeleteProduct = () => {
    if (!deleteTarget) return;
    deleteProduct(deleteTarget.id);
    setDeleteTarget(null);
  };

  const bulkDelete = () => {
    if (!selected.length) return;
    if (usingSampleData || selected.every(isSampleProductId)) {
      setProducts((prev) => prev.filter((p) => !selected.includes(p.id || p._id)));
      setTotalProducts((n) => Math.max(0, n - selected.length));
      setAlertBox?.({ open: true, error: false, msg: "Selected sample products removed." });
      setSelected([]);
      return;
    }
    postData("/api/products/bulk/delete", { ids: selected }).then(() => {
      setAlertBox?.({ open: true, error: false, msg: "Selected products deleted." });
      setSelected([]);
      loadProducts();
    });
  };

  const bulkStatus = (status) => {
    if (!selected.length) return;
    if (usingSampleData || selected.every(isSampleProductId)) {
      setProducts((prev) =>
        prev.map((p) => (selected.includes(p.id || p._id) ? { ...p, status } : p))
      );
      setAlertBox?.({
        open: true,
        error: false,
        msg: status === "active" ? "Sample products activated." : "Sample products disabled.",
      });
      setSelected([]);
      return;
    }
    postData("/api/products/bulk/status", { ids: selected, status }).then(() => {
      setAlertBox?.({ open: true, error: false, msg: status === "active" ? "Products activated." : "Products disabled." });
      setSelected([]);
      loadProducts();
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Product List"
        breadcrumbs={[{ label: "Products" }]}
        action={
          <Link to={`${ADMIN_BASE}/product/upload`} className="admin-dash__btn">
            Add Product
          </Link>
        }
      />

      <div className="admin-dash__stats">
        <StatCard icon={<MdShoppingBag />} label="Products" value={totalProducts} />
        <StatCard icon={<MdCategory />} label="Categories" value={totalCategory} gradient={["#a67c52", "#c9a961"]} />
        <StatCard icon={<IoShieldCheckmarkSharp />} label="Sub categories" value={totalSubCategory} gradient={["#6b5344", "#d4a574"]} />
      </div>

      <section className="admin-dash__panel">
        {usingSampleData && (
          <p className="admin-dash__sample-banner">Showing sample handmade products — connect live data via Add Product or your API.</p>
        )}
        <div className="admin-dash__toolbar admin-dash__toolbar--wrap admin-dash__toolbar--filters">
          <input
            className="admin-dash__input"
            style={{ maxWidth: "14rem" }}
            placeholder="Search products…"
            aria-label="Search products"
            value={searchKeyword}
            onChange={(e) => { setSearchKeyword(e.target.value); setPage(0); }}
          />
          <select className="admin-dash__select" style={{ maxWidth: "12rem" }} value={categoryVal} onChange={(e) => { setCategoryVal(e.target.value); setPage(0); }} aria-label="Filter by category">
            <option value="all">All categories</option>
            {catData?.categoryList?.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          <PriceRangeFilter
            bounds={priceBounds}
            value={priceRange}
            onApply={(range) => {
              setPriceRange(range);
              setPage(0);
            }}
          />
          <select className="admin-dash__select" style={{ maxWidth: "10rem" }} value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setPage(0); }} aria-label="Filter by stock">
            <option value="all">All stock</option>
            <option value="in_stock">In stock</option>
            <option value="low_stock">Low stock</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
          <select className="admin-dash__select" style={{ maxWidth: "10rem" }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} aria-label="Filter by status">
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            type="button"
            className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm admin-dash__toolbar-end"
            onClick={() => exportCsv(filtered)}
          >
            <FaFileExport aria-hidden />
            Export
          </button>
        </div>

        {selected.length > 0 && (
          <div className="admin-dash__bulk-bar">
            <span>{selected.length} selected</span>
            <button type="button" className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm" onClick={() => bulkStatus("active")}>Activate</button>
            <button type="button" className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm" onClick={() => bulkStatus("inactive")}>Disable</button>
            <button type="button" className="admin-dash__btn admin-dash__btn--danger admin-dash__btn--sm" onClick={bulkDelete}>Delete</button>
          </div>
        )}

        <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
          <table className="admin-dash__table admin-dash__table--modern admin-dash__table--products">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={slice.length > 0 && slice.every((p) => selected.includes(p.id || p._id))}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    aria-label="Select all"
                  />
                </th>
                <th>Image</th>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Date Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr>
                  <td colSpan={11} className="admin-dash__table-empty">No products match your filters.</td>
                </tr>
              ) : (
                slice.map((item) => {
                const id = item.id || item._id;
                const isActive = (item.status || "active") === "active";
                return (
                  <tr key={id}>
                    <td>
                      <input type="checkbox" checked={selected.includes(id)} onChange={() => toggleSelect(id)} aria-label={`Select ${item.name}`} />
                    </td>
                    <td>
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt="" className="admin-dash__table-thumb" />
                      ) : (
                        <div className="admin-dash__product-placeholder admin-dash__table-thumb" />
                      )}
                    </td>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.sku || "—"}</td>
                    <td>{item.catName || "—"}</td>
                    <td><strong>Rs {Number(item.price).toLocaleString()}</strong></td>
                    <td>
                      <span className={`admin-dash__stock-pill${Number(item.countInStock) <= 0 ? " admin-dash__stock-pill--out" : Number(item.countInStock) <= (item.minStockAlert || 5) ? " admin-dash__stock-pill--low" : ""}`}>
                        {item.countInStock ?? 0}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-dash__status-badge admin-dash__status-badge--${isActive ? "completed" : "cancelled"}`}>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{item.isFeatured ? "Yes" : "No"}</td>
                    <td>{formatDate(item.dateCreated)}</td>
                    <td>
                      <div className="admin-dash__actions">
                        <Link to={`${ADMIN_BASE}/product/details/${id}`} className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm" title="View"><FaEye /></Link>
                        <Link to={`${ADMIN_BASE}/product/edit/${id}`} className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm" title="Edit"><FaPencilAlt /></Link>
                        <button type="button" className="admin-dash__btn admin-dash__btn--danger admin-dash__btn--sm" onClick={() => requestDeleteProduct(item)} title="Delete"><MdDelete /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-dash__pagination">
          <span>Page {page + 1} of {totalPages} · {filtered.length} products</span>
          <select className="admin-dash__select" style={{ maxWidth: "5rem" }} value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <button type="button" className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <button type="button" className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      </section>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete product?"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onConfirm={confirmDeleteProduct}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
