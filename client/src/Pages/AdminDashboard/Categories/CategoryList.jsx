import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { FaPencilAlt, FaPlus } from "react-icons/fa";
import { MdDelete, MdCategory, MdLayers } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import AdminPagination from "../../../Components/AdminDashboard/AdminPagination";
import AdminConfirmDialog from "../../../Components/AdminDashboard/AdminConfirmDialog";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import { deleteData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import {
  buildProductCountMap,
  flattenCategories,
  getCategoryListSampleData,
  isSampleCategoryId,
} from "./categoryListUtils";

export default function CategoryList() {
  const { setAlertBox } = useOutletContext();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [parentFilter, setParentFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const applySampleCategories = () => {
    setCategories(getCategoryListSampleData());
    setUsingSampleData(true);
  };

  const loadCategories = () => {
    fetchDataFromApi("/api/category")
      .then((res) => {
        const list = res?.categoryList || [];
        if (list.length) {
          setCategories(flattenCategories(list));
          setUsingSampleData(false);
        } else {
          applySampleCategories();
        }
      })
      .catch(() => applySampleCategories());
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    applySampleCategories();
    fetchDataFromApi("/api/products")
      .then((res) => setProducts(res?.products || []))
      .catch(() => {});
  }, []);

  const productCounts = useMemo(() => buildProductCountMap(products), [products]);

  const stats = useMemo(() => {
    const mainCount = categories.filter((cat) => cat.isMain).length;
    const subCount = categories.filter((cat) => !cat.isMain).length;
    const activeCount = categories.filter((cat) => (cat.status || "active") === "active").length;
    return { mainCount, subCount, activeCount, total: categories.length };
  }, [categories]);

  const filtered = useMemo(() => {
    let list = [...categories];

    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      list = list.filter((cat) =>
        [cat.name, cat.parentName, cat.slug].some((v) => String(v || "").toLowerCase().includes(q))
      );
    }

    if (statusFilter === "active") list = list.filter((cat) => (cat.status || "active") === "active");
    if (statusFilter === "inactive") list = list.filter((cat) => (cat.status || "active") === "inactive");
    if (parentFilter === "main") list = list.filter((cat) => cat.isMain);
    if (parentFilter === "sub") list = list.filter((cat) => !cat.isMain);

    return list;
  }, [categories, searchKeyword, statusFilter, parentFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const slice = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const deleteCategory = (id) => {
    if (usingSampleData || isSampleCategoryId(id)) {
      setCategories((prev) => prev.filter((cat) => (cat._id || cat.id) !== id));
      setAlertBox?.({ open: true, error: false, msg: "Category removed from sample list." });
      return;
    }
    deleteData(`/api/category/${id}`).then(() => {
      setAlertBox?.({ open: true, error: false, msg: "Category deleted." });
      loadCategories();
    });
  };

  const requestDelete = (item) => {
    setDeleteTarget({ id: item._id || item.id, name: item.name });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteCategory(deleteTarget.id);
    setDeleteTarget(null);
  };

  const getEditPath = (item) => `${ADMIN_BASE}/category/edit/${item._id || item.id}`;

  return (
    <>
      <AdminPageHeader
        title="Category List"
        subtitle="Manage main categories and subcategories in one place."
        breadcrumbs={[{ label: "Category" }]}
        action={
          <Link to={`${ADMIN_BASE}/category/add`} className="admin-dash__btn">
            <FaPlus />
            Add Category
          </Link>
        }
      />

      <div className="admin-dash__stats">
        <StatCard
          icon={<MdCategory />}
          label="Total categories"
          value={stats.total}
        />
        <StatCard
          icon={<MdLayers />}
          label="Main categories"
          value={stats.mainCount}
          gradient={["#a67c52", "#c9a961"]}
        />
        <StatCard
          icon={<IoShieldCheckmarkSharp />}
          label="Subcategories"
          value={stats.subCount}
          gradient={["#6b5344", "#d4a574"]}
        />
        <StatCard
          icon={<MdCategory />}
          label="Active"
          value={stats.activeCount}
          gradient={["#5a7a5e", "#7a9a7e"]}
        />
      </div>

      <section className="admin-dash__panel">
        <div className="admin-dash__toolbar admin-dash__toolbar--wrap admin-dash__toolbar--filters">
          <input
            className="admin-dash__input"
            style={{ maxWidth: "14rem" }}
            placeholder="Search categories…"
            aria-label="Search categories"
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setPage(0);
            }}
          />
          <select
            className="admin-dash__select"
            style={{ maxWidth: "12rem" }}
            value={parentFilter}
            onChange={(e) => {
              setParentFilter(e.target.value);
              setPage(0);
            }}
            aria-label="Filter by parent type"
          >
            <option value="all">All types</option>
            <option value="main">Main categories</option>
            <option value="sub">Subcategories</option>
          </select>
          <select
            className="admin-dash__select"
            style={{ maxWidth: "10rem" }}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            aria-label="Filter by status"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="admin-dash__data-table">
          <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
            <table className="admin-dash__table admin-dash__table--modern admin-dash__table--categories">
            <thead>
              <tr>
                <th>Image</th>
                <th>Category Name</th>
                <th>Parent</th>
                <th>Products</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-dash__table-empty">
                    No categories match your filters.
                  </td>
                </tr>
              ) : (
                slice.map((item) => {
                  const id = item._id || item.id;
                  const isActive = (item.status || "active") === "active";
                  const count = item.productCount ?? productCounts[id] ?? 0;

                  return (
                    <tr
                      key={id}
                      className={
                        item.isMain ? "" : "admin-dash__category-row--sub"
                      }
                    >
                      <td>
                        {item.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            alt=""
                            className="admin-dash__table-thumb"
                          />
                        ) : (
                          <div className="admin-dash__product-placeholder admin-dash__table-thumb" />
                        )}
                      </td>
                      <td>
                        <strong>{item.name}</strong>
                        {!item.isMain && (
                          <span className="admin-dash__category-sub-pill">
                            Subcategory
                          </span>
                        )}
                      </td>
                      <td>{item.parentName || "—"}</td>
                      <td>
                        <span className="admin-dash__badge">{count}</span>
                      </td>
                      <td>
                        <span
                          className={`admin-dash__status-badge admin-dash__status-badge--${isActive ? "completed" : "cancelled"}`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-dash__actions">
                          <Link
                            to={getEditPath(item)}
                            className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                            title="Edit"
                          >
                            <FaPencilAlt />
                          </Link>
                          <button
                            type="button"
                            className="admin-dash__btn admin-dash__btn--danger admin-dash__btn--sm admin-dash__btn--icon"
                            onClick={() => requestDelete(item)}
                            title="Delete"
                          >
                            <MdDelete />
                          </button>
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
            totalItems={filtered.length}
            itemLabel="categories"
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

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete category?"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
