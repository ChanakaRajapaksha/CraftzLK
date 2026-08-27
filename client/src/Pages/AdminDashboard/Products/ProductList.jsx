import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { FaEye, FaFileExport, FaPencilAlt, FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import AdminPagination from "../../../Components/AdminDashboard/AdminPagination";
import AdminConfirmDialog from "../../../Components/AdminDashboard/AdminConfirmDialog";
import AdminLoadingState from "../../../Components/AdminDashboard/AdminLoadingState";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import { MdShoppingBag, MdCategory } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import CategoryController from "../../../controllers/category.controller.js";
import ProductController from "../../../controllers/product.controller.js";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import PriceRangeFilter, { getProductPriceBounds } from "../../../Components/AdminDashboard/PriceRangeFilter";
import ProductFormModal from "./ProductFormModal";

const DEFAULT_STATS = {
  total: 0,
  activeCount: 0,
  inactiveCount: 0,
  lowStockCount: 0,
  outOfStockCount: 0,
  featuredCount: 0,
  priceBounds: { min: 500, max: 25000 },
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-LK", { year: "numeric", month: "short", day: "numeric" });
}

function formatPromoTypeLabel(type) {
  const map = {
    product: "Product Discount",
    category: "Category Discount",
    seasonal: "Seasonal Sale",
  };
  return map[type] || type || "Discount";
}

function renderProductDiscountCell(item) {
  const hasPriceDiscount =
    Number(item.discount) > 0 && Number(item.oldPrice) > Number(item.price);

  if (!item.promoDiscountName && !hasPriceDiscount) {
    return "—";
  }

  const valueLabel =
    item.discountType === "fixed" && hasPriceDiscount
      ? `Rs ${Number(item.oldPrice - item.price).toLocaleString()} off`
      : hasPriceDiscount
        ? `-${Math.round(Number(item.discount))}%`
        : "";

  return (
    <div className="admin-dash__product-discount-cell">
      {item.promoDiscountType ? (
        <span className="admin-dash__promo-type-pill">
          {formatPromoTypeLabel(item.promoDiscountType)}
        </span>
      ) : null}
      {valueLabel ? (
        <span className="admin-dash__price-badge">{valueLabel}</span>
      ) : null}
      {item.promoDiscountName ? (
        <span className="admin-dash__product-discount-name">{item.promoDiscountName}</span>
      ) : null}
    </div>
  );
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

function buildListParams({ page, rowsPerPage, searchKeyword, categoryVal, priceRange, stockFilter, statusFilter, perPageOverride }) {
  const params = new URLSearchParams({
    page: String(page + 1),
    perPage: String(perPageOverride ?? rowsPerPage),
  });

  if (searchKeyword.trim()) params.set("search", searchKeyword.trim());
  if (categoryVal !== "all") params.set("catId", categoryVal);
  if (stockFilter !== "all") params.set("stock", stockFilter);
  if (statusFilter !== "all") params.set("status", statusFilter);
  if (priceRange) {
    params.set("minPrice", String(priceRange[0]));
    params.set("maxPrice", String(priceRange[1]));
  }

  return params;
}

export default function ProductList() {
  const { catData, setAlertBox } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [totalCategory, setTotalCategory] = useState(0);
  const [totalSubCategory, setTotalSubCategory] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selected, setSelected] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryVal, setCategoryVal] = useState("all");
  const [priceRange, setPriceRange] = useState(null);
  const [stockFilter, setStockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const hasActiveFilters = useMemo(
    () =>
      Boolean(searchKeyword.trim()) ||
      categoryVal !== "all" ||
      Boolean(priceRange) ||
      stockFilter !== "all" ||
      statusFilter !== "all",
    [searchKeyword, categoryVal, priceRange, stockFilter, statusFilter]
  );

  const priceBounds = useMemo(
    () => getProductPriceBounds([], stats.priceBounds),
    [stats.priceBounds]
  );

  const loadProducts = useCallback(() => {
    setLoading(true);
    setLoadError(false);

    const params = buildListParams({
      page,
      rowsPerPage,
      searchKeyword,
      categoryVal,
      priceRange,
      stockFilter,
      statusFilter,
    });

    ProductController.getAdminList(params.toString())
      .then((res) => {
        if (res?.success === false) {
          throw new Error(res?.message || "Failed to load products.");
        }

        setProducts(Array.isArray(res?.products) ? res.products : []);
        setTotalItems(Number(res?.total) || 0);
        setTotalPages(Math.max(1, Number(res?.totalPages) || 1));
        setStats(res?.stats || DEFAULT_STATS);
        setSelected([]);
      })
      .catch(() => {
        setProducts([]);
        setTotalItems(0);
        setTotalPages(1);
        setStats(DEFAULT_STATS);
        setLoadError(true);
        setSelected([]);
      })
      .finally(() => setLoading(false));
  }, [page, rowsPerPage, searchKeyword, categoryVal, priceRange, stockFilter, statusFilter]);

  useEffect(() => {
    window.scrollTo(0, 0);
    CategoryController.getCount().then((res) => setTotalCategory(res?.categoryCount ?? 0));
    CategoryController.getSubCategoryCount().then((res) => setTotalSubCategory(res?.categoryCount ?? 0));
  }, []);

  useEffect(() => {
    const editId = searchParams.get("edit");
    const action = searchParams.get("action");

    if (editId) {
      setEditingProductId(editId);
      setModalOpen(true);
    } else if (action === "add") {
      setEditingProductId(null);
      setModalOpen(true);
    }
  }, [searchParams]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingProductId(null);
    if (searchParams.get("edit") || searchParams.get("action")) {
      setSearchParams({}, { replace: true });
    }
  };

  const openCreateModal = () => {
    setEditingProductId(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingProductId(item._id || item.id);
    setModalOpen(true);
  };

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const toggleSelectAll = (checked) => {
    setSelected(checked ? products.map((p) => p.id || p._id) : []);
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const deleteProduct = (id) => {
    ProductController.remove(id)
      .then((res) => {
        if (res?.success === false) {
          setAlertBox?.({
            open: true,
            error: true,
            msg: res?.message || "Failed to delete product.",
          });
          return;
        }
        setAlertBox?.({ open: true, error: false, msg: "Product deleted." });
        setSelected((prev) => prev.filter((x) => x !== id));
        loadProducts();
      })
      .catch((error) => {
        const message = error?.response?.data?.message || "Failed to delete product.";
        setAlertBox?.({ open: true, error: true, msg: message });
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
    ProductController.bulkDelete(selected)
      .then((res) => {
        if (res?.success === false) {
          setAlertBox?.({
            open: true,
            error: true,
            msg: res?.message || "Failed to delete selected products.",
          });
          return;
        }
        setAlertBox?.({ open: true, error: false, msg: "Selected products deleted." });
        setSelected([]);
        loadProducts();
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to delete selected products." });
      });
  };

  const bulkStatus = (status) => {
    if (!selected.length) return;
    ProductController.bulkUpdateStatus(selected, status)
      .then((res) => {
        if (res?.success === false) {
          setAlertBox?.({
            open: true,
            error: true,
            msg: res?.message || "Failed to update product status.",
          });
          return;
        }
        setAlertBox?.({
          open: true,
          error: false,
          msg: status === "active" ? "Products activated." : "Products disabled.",
        });
        setSelected([]);
        loadProducts();
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to update product status." });
      });
  };

  const handleExport = () => {
    if (exporting) return;
    setExporting(true);

    const params = buildListParams({
      page: 0,
      rowsPerPage,
      searchKeyword,
      categoryVal,
      priceRange,
      stockFilter,
      statusFilter,
      perPageOverride: Math.max(totalItems, 1),
    });

    ProductController.getAdminList(params.toString())
      .then((res) => {
        const list = Array.isArray(res?.products) ? res.products : [];
        if (!list.length) {
          setAlertBox?.({ open: true, error: true, msg: "No products to export." });
          return;
        }
        exportCsv(list);
      })
      .catch(() => {
        setAlertBox?.({ open: true, error: true, msg: "Failed to export products." });
      })
      .finally(() => setExporting(false));
  };

  const emptyMessage = loadError
    ? "Unable to load products. Please try again."
    : hasActiveFilters
      ? "No products match your filters."
      : "No products yet. Add your first product to start selling.";

  return (
    <>
      <AdminPageHeader
        title="Product List"
        breadcrumbs={[{ label: "Products" }]}
        action={
          <button type="button" className="admin-dash__btn" onClick={openCreateModal}>
            <FaPlus />
            Add Product
          </button>
        }
      />

      <div className="admin-dash__stats">
        <StatCard icon={<MdShoppingBag />} label="Products" value={stats.total} />
        <StatCard icon={<MdCategory />} label="Categories" value={totalCategory} gradient={["#a67c52", "#c9a961"]} />
        <StatCard icon={<IoShieldCheckmarkSharp />} label="Sub categories" value={totalSubCategory} gradient={["#6b5344", "#d4a574"]} />
      </div>

      <section className="admin-dash__panel">
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
            onClick={handleExport}
            disabled={exporting || loading}
          >
            <FaFileExport aria-hidden />
            {exporting ? "Exporting…" : "Export"}
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

        <div className="admin-dash__data-table">
          <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
            <table className="admin-dash__table admin-dash__table--modern admin-dash__table--products">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={products.length > 0 && products.every((p) => selected.includes(p.id || p._id))}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    aria-label="Select all"
                    disabled={loading || products.length === 0}
                  />
                </th>
                <th>Image</th>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Date Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} className="admin-dash__table-empty">
                    <AdminLoadingState message="Loading products…" compact />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={12} className="admin-dash__table-empty">{emptyMessage}</td>
                </tr>
              ) : (
                products.map((item) => {
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
                    <td>
                      {Number(item.discount) > 0 && Number(item.oldPrice) > Number(item.price) ? (
                        <span className="admin-dash__price-stack">
                          <span className="admin-dash__price-old">
                            Rs {Number(item.oldPrice).toLocaleString()}
                          </span>
                          <strong>Rs {Number(item.price).toLocaleString()}</strong>
                          <span className="admin-dash__price-badge">-{Math.round(Number(item.discount))}%</span>
                        </span>
                      ) : (
                        <strong>Rs {Number(item.price).toLocaleString()}</strong>
                      )}
                    </td>
                    <td>{renderProductDiscountCell(item)}</td>
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
                        <button type="button" className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm" title="Edit" onClick={() => openEditModal(item)}><FaPencilAlt /></button>
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

          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
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

      <ProductFormModal
        open={modalOpen}
        productId={editingProductId}
        onClose={closeModal}
        onSaved={loadProducts}
        setAlertBox={setAlertBox}
        catData={catData}
      />

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
