import { useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { FaAngleDown, FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import {
  IoPersonOutline,
  IoBagCheckOutline,
  IoGridOutline,
} from "react-icons/io5";
import { MyContext } from "../../../App";
import { RiLogoutCircleRFill } from "react-icons/ri";
import UserAvatarImgComponent from "../../userAvatarImg";
import { MEGA_MENU_COLUMNS } from "../../../data/megaMenuCategories";
import {
  getCategoryCollectionsPath,
  getSubcategoryCollectionsPath,
} from "../../../Pages/Collections/collectionsConstants";

/** Path the "Shop" header link routes to (Collections / "All" landing page). */
export const SHOP_PATH = "/collections/all";

export { MEGA_MENU_COLUMNS };

/** Resolve an API category path by display title; null when no match. */
export function findCategoryPathByTitle(categoryList, title) {
  return findCategoryPath(categoryList, title);
}

function normalizeName(s) {
  return (s || "")
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "'")
    .replace(/\s+/g, " ");
}

function findSubCatPath(categoryList, subName) {
  const needle = normalizeName(subName);
  for (const cat of categoryList || []) {
    for (const child of cat?.children || []) {
      if (normalizeName(child?.name) === needle) {
        return `/products/subCat/${child._id}`;
      }
    }
  }
  return null;
}

function findCategoryPath(categoryList, title) {
  const needle = normalizeName(title);
  for (const cat of categoryList || []) {
    if (normalizeName(cat?.name) === needle) {
      return `/products/category/${cat._id}`;
    }
  }
  return null;
}

function formatCartTotal(cartData) {
  const total =
    cartData?.length !== 0
      ? cartData
          ?.map((item) => parseInt(item.price, 10) * item.quantity)
          .reduce((sum, value) => sum + value, 0)
      : 0;
  return (total ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });
}

const SecondaryCategoryNav = ({ isOpenNav, closeNav, navData }) => {
  const context = useContext(MyContext);
  const location = useLocation();
  const history = useNavigate();
  const [megaOpen, setMegaOpen] = useState(false);
  /** Mobile drawer: root | categories (column titles) | category-items */
  const [drawerPanel, setDrawerPanel] = useState("root");
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(null);
  const wrapRef = useRef(null);

  const shopPath = SHOP_PATH;

  const tailLinks = [
    { label: "Gifts", to: "/gifts" },
    { label: "Eco", to: "/eco" },
    { label: "About", to: "/about" },
  ];

  const isHomeActive = location.pathname === "/";
  const isShopActive = location.pathname === shopPath && !megaOpen;

  const mainCategoryLink = (title) => getCategoryCollectionsPath(title);

  const subCategoryLink = (parentTitle, subName) => {
    const apiPath = findSubCatPath(navData, subName);
    return apiPath || getSubcategoryCollectionsPath(parentTitle, subName);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    context.setIsLogin(false);
    history("/signIn");
    closeNav?.();
  };

  useEffect(() => {
    if (!megaOpen) return;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setMegaOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMegaOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [megaOpen]);

  useEffect(() => {
    setMegaOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpenNav) {
      setDrawerPanel("root");
      setActiveCategoryIndex(null);
    }
  }, [isOpenNav]);

  const openCategoriesPanel = () => setDrawerPanel("categories");

  const openCategoryItems = (index) => {
    setActiveCategoryIndex(index);
    setDrawerPanel("category-items");
  };

  const backToCategories = () => {
    setDrawerPanel("categories");
    setActiveCategoryIndex(null);
  };

  const backToRoot = () => setDrawerPanel("root");

  const activeCategory =
    activeCategoryIndex != null ? MEGA_MENU_COLUMNS[activeCategoryIndex] : null;

  const cartTotalFormatted = formatCartTotal(context.cartData);

  const drawerAccountLinks = [
    ...(context?.user?.role === "admin"
      ? [{ label: "Dashboard", to: "/dashboard", icon: IoGridOutline }]
      : []),
    { label: "My Account", to: "/my-account", icon: IoPersonOutline },
    { label: "Orders", to: "/orders", icon: IoBagCheckOutline },
  ];

  const showMobileDrawerUser =
    context.windowWidth < 992 && context?.isLogin === true;

  const isMobileDrawer = context.windowWidth < 992;

  const mobileDrawer = (
    <div
      className={`navPart2 d-flex align-items-center res-nav-wrapper secondary-category-nav__drawer w-100 ${
        isOpenNav === true ? "open" : "close"
      }`}
    >
      <div className="res-nav-overlay" onClick={closeNav} role="presentation" />
      <div
        className={`res-nav${
          showMobileDrawerUser ? " secondary-category-nav__drawer--signed-in" : ""
        }`}
      >
        <div className="secondary-category-nav__drawer-scroll">
          {showMobileDrawerUser && (
            <div className="secondary-category-nav__drawer-user">
              <div className="secondary-category-nav__drawer-user-info d-flex align-items-center">
                <UserAvatarImgComponent
                  lg
                  img={context?.user?.image}
                  userName={
                    context?.user?.name
                      ? context?.user?.name?.toUpperCase()
                      : ""
                  }
                />
                <div className="secondary-category-nav__drawer-user-text ml-3">
                  <p className="secondary-category-nav__drawer-user-name mb-0">
                    {context?.user?.name}
                  </p>
                  <p className="secondary-category-nav__drawer-user-email mb-0">
                    {context?.user?.email}
                  </p>
                </div>
              </div>
              <p className="secondary-category-nav__drawer-user-total mb-0">
                {cartTotalFormatted}
              </p>
              <ul className="secondary-category-nav__drawer-account-list">
                {drawerAccountLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className="secondary-category-nav__drawer-row secondary-category-nav__drawer-row--account"
                        onClick={closeNav}
                      >
                        <Icon
                          className="secondary-category-nav__drawer-account-icon"
                          aria-hidden
                        />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div
                className="secondary-category-nav__drawer-divider"
                role="separator"
                aria-hidden
              />
            </div>
          )}

          <div className="secondary-category-nav__drawer-body">
          <div className="secondary-category-nav__drawer-viewport">
            <div
              className="secondary-category-nav__drawer-track"
              data-panel={drawerPanel}
            >
              <div
                className="secondary-category-nav__drawer-slide"
                aria-hidden={drawerPanel !== "root"}
              >
                <ul className="list list-inline ml-auto w-100 secondary-category-nav__drawer-root-list">
                  <li className="list-inline-item w-100">
                    <Link to="/" onClick={closeNav}>
                      <Button>Home</Button>
                    </Link>
                  </li>
                  <li className="list-inline-item w-100">
                    <Link to={shopPath} onClick={closeNav}>
                      <Button>Shop</Button>
                    </Link>
                  </li>
                  <li className="list-inline-item w-100">
                    <Button
                      type="button"
                      className="d-flex align-items-center w-100 secondary-category-nav__drawer-categories-btn"
                      onClick={openCategoriesPanel}
                    >
                      Categories
                      <FaAngleRight
                        className="secondary-category-nav__drawer-chev"
                        aria-hidden
                      />
                    </Button>
                  </li>
                  {tailLinks.map((link) => (
                    <li key={link.label} className="list-inline-item w-100">
                      <Link to={link.to} onClick={closeNav}>
                        <Button>{link.label}</Button>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="secondary-category-nav__drawer-slide"
                role="navigation"
                aria-label="Browse categories"
                aria-hidden={drawerPanel !== "categories"}
              >
                <div className="secondary-category-nav__drawer-slide-inner">
                  <button
                    type="button"
                    className="secondary-category-nav__drawer-back"
                    onClick={backToRoot}
                  >
                    <FaAngleLeft aria-hidden />
                    <span>Categories</span>
                  </button>
                  <ul className="secondary-category-nav__drawer-panel-list">
                    {MEGA_MENU_COLUMNS.map((col, index) => (
                      <li key={col.title} className="secondary-category-nav__drawer-category-item">
                        <Link
                          to={mainCategoryLink(col.title)}
                          className="secondary-category-nav__drawer-row secondary-category-nav__drawer-row--link secondary-category-nav__drawer-row--category"
                          onClick={closeNav}
                        >
                          <span>{col.title}</span>
                        </Link>
                        <button
                          type="button"
                          className="secondary-category-nav__drawer-row-chev-btn"
                          onClick={() => openCategoryItems(index)}
                          aria-label={`Browse ${col.title} subcategories`}
                        >
                          <FaAngleRight
                            className="secondary-category-nav__drawer-chev"
                            aria-hidden
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div
                className="secondary-category-nav__drawer-slide"
                role="navigation"
                aria-label={activeCategory?.title || "Subcategories"}
                aria-hidden={drawerPanel !== "category-items"}
              >
                <div className="secondary-category-nav__drawer-slide-inner">
                  <button
                    type="button"
                    className="secondary-category-nav__drawer-back"
                    onClick={backToCategories}
                  >
                    <FaAngleLeft aria-hidden />
                    <span>{activeCategory?.title}</span>
                  </button>
                  <ul className="secondary-category-nav__drawer-panel-list">
                    {activeCategory?.items.map((item) => (
                      <li key={item}>
                        <Link
                          to={subCategoryLink(activeCategory.title, item)}
                          className="secondary-category-nav__drawer-row secondary-category-nav__drawer-row--link"
                          onClick={closeNav}
                        >
                          <span>{item}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>

        <div className="secondary-category-nav__drawer-footer pt-3 pl-3 pr-3 pb-3">
          {context?.isLogin === false ? (
            <Link to="/signIn" onClick={closeNav}>
              <Button className="btn-blue w-100 btn-big">Sign In</Button>
            </Link>
          ) : (
            <Button className="btn-blue w-100 btn-big" onClick={logout}>
              <RiLogoutCircleRFill /> Logout
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <nav className="secondary-category-nav" aria-label="Main site sections">
      <div className="secondary-category-nav__bar d-none d-lg-block" ref={wrapRef}>
        <div className="container">
          <div className="secondary-category-nav__inner d-none d-lg-flex align-items-center justify-content-center flex-wrap">
            <Link
              to="/"
              className={`secondary-category-nav__link ${isHomeActive ? "is-active" : ""}`}
            >
              Home
            </Link>
            <Link
              to={shopPath}
              className={`secondary-category-nav__link ${isShopActive ? "is-active" : ""}`}
            >
              Shop
            </Link>

            <div className="secondary-category-nav__dropdown-trigger">
              <button
                type="button"
                className={`secondary-category-nav__link secondary-category-nav__link--button ${megaOpen ? "is-active" : ""}`}
                aria-expanded={megaOpen}
                aria-haspopup="true"
                onClick={() => setMegaOpen((v) => !v)}
              >
                Categories
                <FaAngleDown
                  className={`secondary-category-nav__chev ${megaOpen ? "secondary-category-nav__chev--open" : ""}`}
                  aria-hidden
                />
              </button>
            </div>

            {tailLinks.map((link) => {
              const tailActive = location.pathname === link.to;
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`secondary-category-nav__link ${tailActive ? "is-active" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div
          className={`secondary-category-nav__mega ${megaOpen ? "is-open" : ""}`}
          role="region"
          aria-label="All product categories"
        >
          <div className="container py-4">
            <div className="secondary-category-nav__mega-grid">
              {MEGA_MENU_COLUMNS.map((col) => (
                <div key={col.title} className="secondary-category-nav__mega-col">
                  <Link
                    to={mainCategoryLink(col.title)}
                    onClick={() => setMegaOpen(false)}
                    className="secondary-category-nav__mega-heading secondary-category-nav__mega-heading-link"
                  >
                    {col.title}
                  </Link>
                  <ul className="secondary-category-nav__mega-list">
                    {col.items.map((item) => (
                      <li key={item}>
                        <Link
                          to={subCategoryLink(col.title, item)}
                          onClick={() => setMegaOpen(false)}
                          className="secondary-category-nav__mega-sublink"
                        >
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isMobileDrawer && createPortal(mobileDrawer, document.body)}
    </nav>
  );
};

export default SecondaryCategoryNav;
