import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaPencilAlt } from "react-icons/fa";
import { MdHome, MdCategory, MdShoppingBag } from "react-icons/md";
import { IoTrendingUp } from "react-icons/io5";
import AdminPageHeader from "../../../Components/AdminDashboard/AdminPageHeader";
import StatCard from "../../../Components/AdminDashboard/StatCard";
import HomepageController from "../../../controllers/homepage.controller.js";
import { ADMIN_BASE } from "../../../Components/AdminDashboard/adminNav";
import {
  HOMEPAGE_SECTIONS,
  getSampleHomepageContent,
  getSectionSummary,
} from "./homepageContentDefaults";
import { getPromoStatusBadge } from "../Promotions/promoListHelpers";

const SECTION_ICONS = {
  featuredProducts: MdShoppingBag,
  trendingProducts: IoTrendingUp,
  newArrivals: MdShoppingBag,
  bestSellers: MdShoppingBag,
  popularCategories: MdCategory,
};

export default function HomepageSectionsList() {
  const [content, setContent] = useState(getSampleHomepageContent());
  const [usingSampleData, setUsingSampleData] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    window.scrollTo(0, 0);
    HomepageController.getContent()
      .then((res) => {
        if (res?.content) {
          setContent(res.content);
          setUsingSampleData(false);
        }
      })
      .catch(() => {});
  }, []);

  const stats = useMemo(() => {
    const activeCount = HOMEPAGE_SECTIONS.filter(
      (s) => content?.[s.key]?.enabled !== false
    ).length;
    const productSections = ["featuredProducts", "trendingProducts"].reduce(
      (sum, key) => sum + (content?.[key]?.productIds?.length || 0),
      0
    );
    const categoryCount = content?.popularCategories?.items?.length || 0;
    return {
      total: HOMEPAGE_SECTIONS.length,
      activeCount,
      productSections,
      categoryCount,
    };
  }, [content]);

  const filtered = useMemo(() => {
    let list = [...HOMEPAGE_SECTIONS];

    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      list = list.filter((item) =>
        [item.label, item.description, item.modeLabel].some((v) =>
          String(v || "").toLowerCase().includes(q)
        )
      );
    }

    if (statusFilter === "active") {
      list = list.filter((item) => content?.[item.key]?.enabled !== false);
    }
    if (statusFilter === "inactive") {
      list = list.filter((item) => content?.[item.key]?.enabled === false);
    }

    return list;
  }, [content, searchKeyword, statusFilter]);

  return (
    <>
      <AdminPageHeader
        title="Homepage Sections"
        subtitle="Control which product rails and category blocks appear on the storefront homepage."
        breadcrumbs={[{ label: "Homepage Content" }]}
      />

      <div className="admin-dash__stats">
        <StatCard icon={<MdHome />} label="Total sections" value={stats.total} />
        <StatCard icon={<MdShoppingBag />} label="Active sections" value={stats.activeCount} gradient={["#5a7a5e", "#7a9a7e"]} />
        <StatCard icon={<MdShoppingBag />} label="Curated products" value={stats.productSections} gradient={["#8b6f47", "#b8860b"]} />
        <StatCard icon={<MdCategory />} label="Popular categories" value={stats.categoryCount} gradient={["#6b5344", "#d4a574"]} />
      </div>

      <section className="admin-dash__panel">
        {usingSampleData && (
          <p className="admin-dash__sample-banner">
            Showing sample homepage configuration — save any section to persist via your API.
          </p>
        )}

        <div className="admin-dash__toolbar admin-dash__toolbar--wrap admin-dash__toolbar--filters">
          <input
            className="admin-dash__input"
            style={{ maxWidth: "14rem" }}
            placeholder="Search sections…"
            aria-label="Search sections"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <select
            className="admin-dash__select"
            style={{ maxWidth: "10rem" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="admin-dash__data-table">
          <div className="admin-dash__table-wrap admin-dash__table-wrap--modern">
            <table className="admin-dash__table admin-dash__table--modern admin-dash__table--homepage">
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Mode</th>
                  <th>Content</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-dash__table-empty">
                      No sections match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((section) => {
                    const Icon = SECTION_ICONS[section.key] || MdHome;
                    const sectionData = content?.[section.key] || {};
                    const summary = getSectionSummary(section.key, content);
                    const isActive = sectionData.enabled !== false;
                    const statusBadge = getPromoStatusBadge(isActive ? "active" : "inactive");

                    return (
                      <tr key={section.key}>
                        <td>
                          <div className="admin-dash__homepage-section-cell">
                            <span className="admin-dash__homepage-section-icon">
                              <Icon />
                            </span>
                            <div>
                              <strong>{section.label}</strong>
                              <span className="admin-dash__homepage-section-desc">{section.description}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="admin-dash__promo-type-pill">{section.modeLabel}</span>
                        </td>
                        <td>{summary.detail}</td>
                        <td>
                          <span className={statusBadge.className}>{statusBadge.label}</span>
                        </td>
                        <td>
                          <div className="admin-dash__actions">
                            <Link
                              to={`${ADMIN_BASE}/homepage/${section.path}`}
                              className="admin-dash__btn admin-dash__btn--ghost admin-dash__btn--sm"
                              title="Configure"
                            >
                              <FaPencilAlt />
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
        </div>
      </section>
    </>
  );
}
