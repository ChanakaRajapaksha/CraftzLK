import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { HiOutlineUserGroup } from "react-icons/hi";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { MdShoppingBag, MdPayments } from "react-icons/md";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import AdminPagination from "../../../Components/AdminDashboard/AdminPagination";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import { fetchDataFromApi } from "../../../utils/api";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import {
  formatCurrency,
  formatCustomerDate,
  getCustomerStatusBadgeClass,
  normalizeCustomer,
} from "./customerUtils";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadCustomers = () => {
    fetchDataFromApi("/api/customers")
      .then((res) => {
        const list = res?.customerList || [];
        setCustomers(list.map(normalizeCustomer));
      })
      .catch(() => setCustomers([]));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadCustomers();
  }, []);

  const stats = useMemo(() => {
    const activeCount = customers.filter((item) => item.status === "active").length;
    const totalOrders = customers.reduce((sum, item) => sum + item.orderCount, 0);
    const totalSpend = customers.reduce((sum, item) => sum + item.totalSpend, 0);
    return {
      total: customers.length,
      activeCount,
      totalOrders,
      totalSpend,
    };
  }, [customers]);

  const filtered = useMemo(() => {
    let list = [...customers];

    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      list = list.filter((item) =>
        [item.name, item.email, item.phone].some((v) => String(v || "").toLowerCase().includes(q))
      );
    }

    if (statusFilter === "active") list = list.filter((item) => item.status === "active");
    if (statusFilter === "inactive") list = list.filter((item) => item.status === "inactive");

    return list;
  }, [customers, searchKeyword, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const slice = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  return (
    <>
      <AdminPageHeader
        title="Customer List"
        subtitle="View customer profiles, spending, and account status."
        breadcrumbs={[{ label: "Customers" }]}
      />

      <div className="admin-dash__stats">
        <StatCard icon={<HiOutlineUserGroup />} label="Total customers" value={stats.total} />
        <StatCard
          icon={<IoShieldCheckmarkSharp />}
          label="Active"
          value={stats.activeCount}
          gradient={["#5a7a5e", "#7a9a7e"]}
        />
        <StatCard
          icon={<MdShoppingBag />}
          label="Total orders"
          value={stats.totalOrders}
          gradient={["#a67c52", "#c9a961"]}
        />
        <StatCard
          icon={<MdPayments />}
          label="Total spend"
          value={formatCurrency(stats.totalSpend)}
          gradient={["#6b5344", "#9a7a6a"]}
        />
      </div>

      <section className="admin-dash__panel">
        <div className="admin-dash__toolbar admin-dash__toolbar--wrap admin-dash__toolbar--filters">
          <input
            className="admin-dash__input"
            style={{ maxWidth: "14rem" }}
            placeholder="Search customers…"
            aria-label="Search customers"
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
            <table className="admin-dash__table admin-dash__table--modern admin-dash__table--customers">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Orders</th>
                  <th>Total Spend</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slice.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="admin-dash__table-empty">
                      No customers match your filters.
                    </td>
                  </tr>
                ) : (
                  slice.map((item) => {
                    const id = item._id || item.id;
                    return (
                      <tr key={id}>
                        <td>
                          <div className="admin-dash__customer-name-cell">
                            {item.images?.[0] ? (
                              <img
                                src={item.images[0]}
                                alt=""
                                className="admin-dash__table-thumb admin-dash__table-thumb--round"
                              />
                            ) : (
                              <div className="admin-dash__product-placeholder admin-dash__table-thumb admin-dash__table-thumb--round" />
                            )}
                            <strong>{item.name}</strong>
                          </div>
                        </td>
                        <td>{item.email}</td>
                        <td>{item.phone}</td>
                        <td>
                          <span className="admin-dash__badge">{item.orderCount}</span>
                        </td>
                        <td><strong>{formatCurrency(item.totalSpend)}</strong></td>
                        <td>
                          <span className={`admin-dash__status-badge admin-dash__status-badge--${getCustomerStatusBadgeClass(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <div className="admin-dash__actions">
                            <Link
                              to={`${ADMIN_BASE}/customers/${id}`}
                              className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                              title="View details"
                            >
                              <FaEye />
                            </Link>
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
            itemLabel="customers"
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
