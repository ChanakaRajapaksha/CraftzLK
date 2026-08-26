import { useState, useContext } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { BiSolidCategory } from "react-icons/bi";
import { FaProductHunt, FaClipboardCheck } from "react-icons/fa";
import { FaAngleRight, FaAngleDown } from "react-icons/fa6";
import { HiOutlineUserGroup } from "react-icons/hi";
import { IoMdPeople, IoMdLogOut, IoMdClose } from "react-icons/io";
import {
  MdCampaign,
  MdHome,
  MdInventory,
  MdLocalShipping,
  MdPayments,
  MdRateReview,
  MdAssessment,
  MdArticle,
  MdNotifications,
  MdSettings,
  MdStorefront,
} from "react-icons/md";
import { toast } from "sonner";
import AuthController from "../../controllers/auth.controller";
import { MyContext } from "../../App";
import { DEFAULT_STORE_LOGO } from "../../utils/storeBrand";
import { adminNavItems, ADMIN_BASE, STOREFRONT_HOME_PATH } from "./adminNav";
import "./admin-dashboard.css";

const ICONS = {
  dashboard: MdDashboard,
  category: BiSolidCategory,
  products: FaProductHunt,
  artisans: HiOutlineUserGroup,
  orders: FaClipboardCheck,
  customers: IoMdPeople,
  promotions: MdCampaign,
  homepage: MdHome,
  reviews: MdRateReview,
  inventory: MdInventory,
  shipping: MdLocalShipping,
  payments: MdPayments,
  reports: MdAssessment,
  cms: MdArticle,
  notifications: MdNotifications,
  settings: MdSettings,
};

function getStoredUser() {
  try {
    const str = localStorage.getItem("user");
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
}

export default function AdminSidebar({ mobileOpen = false, onCloseMobile }) {
  const [openMenus, setOpenMenus] = useState({});
  const navigate = useNavigate();
  const context = useContext(MyContext);
  const storeLogo = context?.storeLogo || DEFAULT_STORE_LOGO;
  const user = context?.user?.name ? context.user : getStoredUser();
  const displayName = user?.name?.trim() || user?.email || "Admin";
  const displayRole =
    (user?.role || "admin").charAt(0).toUpperCase() + (user?.role || "admin").slice(1);

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNavigate = () => {
    onCloseMobile?.();
  };

  const logout = async () => {
    await AuthController.logout();
    context?.setIsLogin?.(false);
    onCloseMobile?.();
    toast.success("Logged out");
    navigate("/");
  };

  return (
    <aside
      id="admin-dash-sidebar"
      className={`admin-dash__sidebar${mobileOpen ? " admin-dash__sidebar--open" : ""}`}
      aria-hidden={false}
    >
      <div className="admin-dash__brand">
        <img src={storeLogo} alt="CraftzLK" />
        <div>
          <p className="admin-dash__brand-name" title={displayName}>
            {displayName}
          </p>
          <p className="admin-dash__brand-role">{displayRole}</p>
        </div>
        <button
          type="button"
          className="admin-dash__sidebar-close"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
        >
          <IoMdClose aria-hidden />
        </button>
      </div>

      <nav className="admin-dash__nav" aria-label="Admin navigation">
        {adminNavItems.map((item) => {
          const Icon = ICONS[item.key] || MdDashboard;

          if (item.children) {
            return (
              <div key={item.key}>
                <button
                  type="button"
                  className="admin-dash__nav-toggle"
                  onClick={() => toggleMenu(item.key)}
                  aria-expanded={Boolean(openMenus[item.key])}
                >
                  <span className="admin-dash__nav-icon">
                    <Icon />
                  </span>
                  <span className="admin-dash__nav-label">{item.label}</span>
                  {openMenus[item.key] ? <FaAngleDown /> : <FaAngleRight />}
                </button>
                {openMenus[item.key] && (
                  <ul className="admin-dash__subnav">
                    {item.children.map((child) => (
                      <li key={child.path}>
                        <NavLink
                          to={child.path}
                          end={
                            child.path === ADMIN_BASE ||
                            child.path === `${ADMIN_BASE}/category` ||
                            child.path === `${ADMIN_BASE}/products` ||
                            child.path === `${ADMIN_BASE}/artisans` ||
                            child.path === `${ADMIN_BASE}/orders` ||
                            child.path === `${ADMIN_BASE}/customers`
                          }
                          onClick={handleNavigate}
                        >
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.key}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `admin-dash__nav-link${isActive ? " admin-dash__nav-link--active" : ""}`
              }
              onClick={handleNavigate}
            >
              <span className="admin-dash__nav-icon">
                <Icon />
              </span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <Link to={STOREFRONT_HOME_PATH} className="admin-dash__store-link" onClick={handleNavigate}>
        <MdStorefront />
        View Home Page
      </Link>

      <button type="button" className="admin-dash__logout" onClick={logout}>
        <IoMdLogOut />
        Logout
      </button>
    </aside>
  );
}
