import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { FaPencilAlt, FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { HiOutlineUserGroup } from "react-icons/hi";
import { MdShoppingBag } from "react-icons/md";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import AdminPagination from "../../../Components/AdminDashboard/AdminPagination";
import AdminConfirmDialog from "../../../Components/AdminDashboard/AdminConfirmDialog";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import { deleteData, fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import {
  getArtisanListSampleData,
  isSampleArtisanId,
} from "./artisanListUtils";

export default function ArtisanList() {
  const { setAlertBox } = useOutletContext();
  const [artisans, setArtisans] = useState([]);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const applySampleArtisans = () => {
    setArtisans(getArtisanListSampleData());
    setUsingSampleData(true);
  };

  const loadArtisans = () => {
    fetchDataFromApi("/api/artisans")
      .then((res) => {
        const list = res?.artisanList || [];
        if (list.length) {
          setArtisans(list);
          setUsingSampleData(false);
        } else {
          applySampleArtisans();
        }
      })
      .catch(() => applySampleArtisans());
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadArtisans();
  }, []);

  const stats = useMemo(() => {
    const activeCount = artisans.filter((item) => (item.status || "active") === "active").length;
    const productTotal = artisans.reduce((sum, item) => sum + (item.productCount || 0), 0);
    return {
      total: artisans.length,
      activeCount,
      inactiveCount: artisans.length - activeCount,
      productTotal,
    };
  }, [artisans]);

  const filtered = useMemo(() => {
    let list = [...artisans];

    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      list = list.filter((item) =>
        [item.name, item.location, item.bio].some((v) => String(v || "").toLowerCase().includes(q))
      );
    }

    if (statusFilter === "active") list = list.filter((item) => (item.status || "active") === "active");
    if (statusFilter === "inactive") list = list.filter((item) => (item.status || "active") === "inactive");

    return list;
  }, [artisans, searchKeyword, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const slice = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const deleteArtisan = (id) => {
    if (usingSampleData || isSampleArtisanId(id)) {
      setArtisans((prev) => prev.filter((item) => (item._id || item.id) !== id));
      setAlertBox?.({ open: true, error: false, msg: "Artisan removed from sample list." });
      return;
    }
    deleteData(`/api/artisans/${id}`).then(() => {
      setAlertBox?.({ open: true, error: false, msg: "Artisan deleted." });
      loadArtisans();
    });
  };

  const requestDelete = (item) => {
    setDeleteTarget({ id: item._id || item.id, name: item.name });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteArtisan(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <>
      <AdminPageHeader
        title="Artisan List"
        subtitle="Manage makers and studios featured on your handmade marketplace."
        breadcrumbs={[{ label: "Brand / Artisan" }]}
        action={
          <Link to={`${ADMIN_BASE}/artisans/add`} className="admin-dash__btn">
            <FaPlus />
            Add Artisan
          </Link>
        }
      />

      <div className="admin-dash__stats">
        <StatCard icon={<HiOutlineUserGroup />} label="Total artisans" value={stats.total} />
        <StatCard
          icon={<IoShieldCheckmarkSharp />}
          label="Active"
          value={stats.activeCount}
          gradient={["#5a7a5e", "#7a9a7e"]}
        />
        <StatCard
          icon={<IoShieldCheckmarkSharp />}
          label="Inactive"
          value={stats.inactiveCount}
          gradient={["#6b5344", "#9a7a6a"]}
        />
        <StatCard
          icon={<MdShoppingBag />}
          label="Linked products"
          value={stats.productTotal}
          gradient={["#a67c52", "#c9a961"]}
        />
      </div>

      <section className="admin-dash__panel">
        {usingSampleData && (
          <p className="admin-dash__sample-banner">
            Showing sample artisans — connect live data via Add Artisan or your API.
          </p>
        )}
        <div className="admin-dash__toolbar admin-dash__toolbar--wrap admin-dash__toolbar--filters">
          <input
            className="admin-dash__input"
            style={{ maxWidth: "14rem" }}
            placeholder="Search artisans…"
            aria-label="Search artisans"
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setPage(0);
            }}
          />
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
            <table className="admin-dash__table admin-dash__table--modern admin-dash__table--artisans">
              <thead>
                <tr>
                  <th>Profile Image</th>
                  <th>Artisan Name</th>
                  <th>Location</th>
                  <th>Products</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slice.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="admin-dash__table-empty">
                      No artisans match your filters.
                    </td>
                  </tr>
                ) : (
                  slice.map((item) => {
                    const id = item._id || item.id;
                    const isActive = (item.status || "active") === "active";
                    const profileImage = item.images?.[0];

                    return (
                      <tr key={id}>
                        <td>
                          {profileImage ? (
                            <img src={profileImage} alt="" className="admin-dash__table-thumb admin-dash__table-thumb--round" />
                          ) : (
                            <div className="admin-dash__product-placeholder admin-dash__table-thumb admin-dash__table-thumb--round" />
                          )}
                        </td>
                        <td>
                          <strong>{item.name}</strong>
                          {item.bio && (
                            <span className="admin-dash__artisan-list-bio">{item.bio}</span>
                          )}
                        </td>
                        <td>{item.location || "—"}</td>
                        <td>
                          <span className="admin-dash__badge">{item.productCount ?? 0}</span>
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
                              to={`${ADMIN_BASE}/artisans/edit/${id}`}
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
            itemLabel="artisans"
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
        title="Delete artisan?"
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
