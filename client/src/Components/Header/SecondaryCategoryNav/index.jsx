import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { FaAngleDown, FaAngleRight } from "react-icons/fa6";
import { MyContext } from "../../../App";
import CountryDropdown from "../../CountryDropdown";
import { RiLogoutCircleRFill } from "react-icons/ri";

/** Hierarchical browse structure — links resolve to API subcategories when names match. */
export const MEGA_MENU_COLUMNS = [
  {
    title: "Home & Living",
    items: ["Wall Art", "Home Decor", "Candles", "Kitchenware", "Cushions"],
  },
  {
    title: "Fashion & Accessories",
    items: [
      "Women's Clothing",
      "Men's Clothing",
      "Jewelry",
      "Bags",
      "Hair Accessories",
    ],
  },
  {
    title: "Handmade Crafts",
    items: ["Wood Crafts", "Clay & Pottery", "Crochet & Knitting", "Resin Art", "Paper Crafts"],
  },
  {
    title: "Kids & Baby",
    items: ["Toys", "Baby Clothing", "Accessories"],
  },
  {
    title: "Art & Collectibles",
    items: ["Paintings", "Sculptures", "Traditional Art"],
  },
  {
    title: "Food & Homemade",
    items: ["Spices", "Pickles", "Sweets", "Snacks"],
  },
];

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

const SecondaryCategoryNav = ({ isOpenNav, closeNav, navData }) => {
  const context = useContext(MyContext);
  const location = useLocation();
  const history = useNavigate();
  const [megaOpen, setMegaOpen] = useState(false);
  const [drawerCategoriesOpen, setDrawerCategoriesOpen] = useState(false);
  const wrapRef = useRef(null);

  const shopPath =
    navData?.length > 0 ? `/products/category/${navData[0]._id}` : "/";

  const tailLinks = [
    { label: "Gifts", to: findCategoryPath(navData, "Gifts") || "/" },
    { label: "Eco", to: findCategoryPath(navData, "Eco") || "/" },
    { label: "Custom", to: findCategoryPath(navData, "Custom") || "/" },
    { label: "About", to: "/" },
  ];

  const isHomeActive = location.pathname === "/";
  const isShopActive =
    location.pathname.startsWith("/products/") && !megaOpen;

  const subLink = (name) => {
    const path = findSubCatPath(navData, name);
    return path || `/search`;
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

            {tailLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="secondary-category-nav__link"
              >
                {link.label}
              </Link>
            ))}
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
                  <h3 className="secondary-category-nav__mega-heading">{col.title}</h3>
                  <ul className="secondary-category-nav__mega-list">
                    {col.items.map((item) => (
                      <li key={item}>
                        <Link
                          to={subLink(item)}
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

      <div
        className={`navPart2 d-flex align-items-center res-nav-wrapper secondary-category-nav__drawer w-100 ${
          isOpenNav === true ? "open" : "close"
        }`}
      >
        <div className="res-nav-overlay" onClick={closeNav} role="presentation" />
        <div className="res-nav">
          {context.windowWidth < 992 && (
            <div className="pl-3">
              <Link to="/" className="logo" onClick={closeNav}>
                <img src="/images/craftzlk.png" alt="CraftzLK logo" />
              </Link>
            </div>
          )}

          <ul className="list list-inline ml-auto w-100">
            {context.windowWidth < 992 && (
              <li className="list-inline-item w-100">
                <div className="p-3">
                  {context.countryList.length !== 0 && <CountryDropdown />}
                </div>
              </li>
            )}

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
            <li className="list-inline-item w-100 position-relative">
              <Button
                className="d-flex align-items-center justify-content-between w-100"
                onClick={() => setDrawerCategoriesOpen((v) => !v)}
              >
                Categories
                <FaAngleRight
                  className={
                    drawerCategoriesOpen ? "secondary-category-nav__chev-drawer-open" : ""
                  }
                />
              </Button>
              {drawerCategoriesOpen && (
                <div className="pl-3 pb-2">
                  {MEGA_MENU_COLUMNS.map((col) => (
                    <div key={col.title} className="mb-2">
                      <p
                        className="mb-1 font-weight-bold text-left secondary-category-nav__drawer-col-title"
                      >
                        {col.title}
                      </p>
                      {col.items.map((item) => (
                        <Link
                          key={item}
                          to={subLink(item)}
                          onClick={closeNav}
                          className="d-block py-1 text-left secondary-category-nav__drawer-sublink"
                        >
                          {item}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </li>
            {tailLinks.map((link) => (
              <li key={link.label} className="list-inline-item w-100">
                <Link to={link.to} onClick={closeNav}>
                  <Button>{link.label}</Button>
                </Link>
              </li>
            ))}
          </ul>

          {context.windowWidth < 992 && (
            <>
              {context?.isLogin === false ? (
                <div className="pt-3 pl-3 pr-3">
                  <Link to="/signIn" onClick={closeNav}>
                    <Button className="btn-blue w-100 btn-big">Sign In</Button>
                  </Link>
                </div>
              ) : (
                <div className="pt-3 pl-3 pr-3" onClick={logout}>
                  <Button className="btn-blue w-100 btn-big">
                    <RiLogoutCircleRFill /> Logout
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default SecondaryCategoryNav;
