import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { FaPencilAlt, FaPlus } from "react-icons/fa";
import { MdDelete, MdCategory, MdLayers } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import AdminPagination from "../../../Components/AdminDashboard/AdminPagination";
import AdminConfirmDialog from "../../../Components/AdminDashboard/AdminConfirmDialog";
import AdminLoadingState from "../../../Components/AdminDashboard/AdminLoadingState";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import CategoryController from "../../../controllers/category.controller.js";
import CategoryFormModal from "./CategoryFormModal";

const DEFAULT_STATS = {
  total: 0,
  mainCount: 0,
  subCount: 0,
  activeCount: 0,
};

export default function CategoryList() {
  const { setAlertBox, catData, fetchCategory } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [parentFilter, setParentFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const hasActiveFilters = useMemo(
    () =>
      Boolean(searchKeyword.trim()) ||
      statusFilter !== "all" ||
      parentFilter !== "all",
    [searchKeyword, statusFilter, parentFilter]
  );

  const loadCategories = useCallback(() => {
    setLoading(true);
    setLoadError(false);

    const params = new URLSearchParams({
      page: String(page + 1),
      perPage: String(rowsPerPage),
    });

    if (searchKeyword.trim()) params.set("search", searchKeyword.trim());
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (parentFilter !== "all") params.set("parentType", parentFilter);

    CategoryController.getAdminList(params.toString())
      .then((res) => {
        if (res?.success === false) {
          throw new Error(res?.message || "Failed to load categories.");
        }

        setCategories(Array.isArray(res?.categories) ? res.categories : []);
        setTotalItems(Number(res?.total) || 0);
        setTotalPages(Math.max(1, Number(res?.totalPages) || 1));
        setStats(res?.stats || DEFAULT_STATS);
      })
      .catch(() => {
        setCategories([]);
        setTotalItems(0);
        setTotalPages(1);
        setStats(DEFAULT_STATS);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [page, rowsPerPage, searchKeyword, statusFilter, parentFilter]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const editId = searchParams.get("edit");
    const action = searchParams.get("action");

    if (editId) {
      setEditingCategoryId(editId);
      setModalOpen(true);
    } else if (action === "add") {
      setEditingCategoryId(null);
      setModalOpen(true);
    }
  }, [searchParams]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategoryId(null);
    if (searchParams.get("edit") || searchParams.get("action")) {
      setSearchParams({}, { replace: true });
    }
  };

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const openCreateModal = () => {
    setEditingCategoryId(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingCategoryId(item._id || item.id);
    setModalOpen(true);
  };

  const deleteCategory = (id) => {
    CategoryController.remove(id)
      .then((res) => {
        if (res?.success === false) {
          setAlertBox?.({
            open: true,
            error: true,
            msg: res?.message || "Failed to delete category.",
          });
          return;
        }
        setAlertBox?.({ open: true, error: false, msg: "Category deleted." });
        fetchCategory?.();
        loadCategories();
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message || "Failed to delete category.";
        setAlertBox?.({ open: true, error: true, msg: message });
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

  const emptyMessage = loadError
    ? "Unable to load categories. Please try again."
    : hasActiveFilters
      ? "No categories match your filters."
      : "No categories yet. Add your first category to organize products.";

  return (
    <>
      <AdminPageHeader
        title="Category List"
        subtitle="Manage main categories and subcategories in one place."
        breadcrumbs={[{ label: "Category" }]}
        action={
          <button type="button" className="admin-dash__btn" onClick={openCreateModal}>
            <FaPlus />
            Add Category
          </button>
        }
      />

      <div className="admin-dash__stats">
        <StatCard icon={<MdCategory />} label="Total categories" value={stats.total} />
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
                {loading ? (
                  <tr>
                    <td colSpan={6} className="admin-dash__table-empty">
                      <AdminLoadingState message="Loading categories…" compact />
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="admin-dash__table-empty">
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  categories.map((item) => {
                    const id = item._id || item.id;
                    const isActive = (item.status || "active") === "active";
                    const count = item.productCount ?? 0;

                    return (
                      <tr
                        key={id}
                        className={item.isMain ? "" : "admin-dash__category-row--sub"}
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
                            <button
                              type="button"
                              className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                              title="Edit"
                              onClick={() => openEditModal(item)}
                            >
                              <FaPencilAlt />
                            </button>
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
            totalItems={totalItems}
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

      <CategoryFormModal
        open={modalOpen}
        categoryId={editingCategoryId}
        initialParentId={editingCategoryId ? "" : searchParams.get("parent") || ""}
        onClose={closeModal}
        onSaved={loadCategories}
        setAlertBox={setAlertBox}
        catData={catData}
        fetchCategory={fetchCategory}
      />

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
