import React, { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { FaAngleRight, FaAngleDown } from "react-icons/fa6";
import { FaProductHunt } from "react-icons/fa";
import { BiSolidCategory } from "react-icons/bi";
import { TbSlideshow } from "react-icons/tb";
import { FaClipboardCheck } from "react-icons/fa";
import { IoMdLogOut } from "react-icons/io";
import AuthController from "../../controllers/auth.controller";
import { MyContext } from "../../App";

const BASE = "/dashboard";

function getStoredUser() {
  try {
    const str = localStorage.getItem("user");
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
}

export default function AdminSidebar() {
  const [openMenus, setOpenMenus] = useState({});
  const navigate = useNavigate();
  const context = useContext(MyContext);
  const user = context?.user ?? getStoredUser();
  const displayName = user?.name?.trim() || user?.email || "Admin";
  const displayRole = (user?.role || "admin").charAt(0).toUpperCase() + (user?.role || "admin").slice(1);

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const closeNav = () => {};

  const logout = async () => {
    await AuthController.logout();
    context?.setIsLogin?.(false);
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ${
      isActive
        ? "bg-amber-100 text-amber-900 border-l-4 border-amber-600"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  const subLinkClass = ({ isActive }) =>
    `block py-2.5 px-4 pl-12 text-sm rounded-r-lg transition-colors border-l-2 ${
      isActive
        ? "bg-amber-50 text-amber-800 border-amber-500 font-medium"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-800 border-transparent"
    }`;

  return (
    <aside className="admin-sidebar w-72 min-h-screen bg-white border-r border-slate-200 flex flex-col shadow-sm">
      {/* User info from context / localStorage */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <img
          src="/images/craftzlk.png"
          alt="CraftzLK"
          className="w-12 h-12 object-contain flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-slate-800 tracking-tight truncate" title={displayName}>
            {displayName}
          </p>
          <p className="text-sm text-amber-600 font-medium mt-1">{displayRole}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {/* Dashboard */}
          <li>
            <NavLink to={BASE} end className={navLinkClass} onClick={closeNav}>
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <MdDashboard className="w-5 h-5" />
              </span>
              <span>Dashboard</span>
            </NavLink>
          </li>

          {/* Category */}
          <li>
            <button
              type="button"
              onClick={() => toggleMenu("category")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ${
                openMenus.category ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <BiSolidCategory className="w-5 h-5" />
              </span>
              <span className="flex-1">Category</span>
              {openMenus.category ? (
                <FaAngleDown className="w-4 h-4 text-slate-400" />
              ) : (
                <FaAngleRight className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {openMenus.category && (
              <ul className="mt-1 ml-2 space-y-0.5 border-l border-slate-200">
                <li><NavLink to={`${BASE}/category`} end className={subLinkClass} onClick={closeNav}>Category List</NavLink></li>
                <li><NavLink to={`${BASE}/category/add`} className={subLinkClass} onClick={closeNav}>Add category</NavLink></li>
                <li><NavLink to={`${BASE}/subCategory`} end className={subLinkClass} onClick={closeNav}>Sub Category List</NavLink></li>
                <li><NavLink to={`${BASE}/subCategory/add`} className={subLinkClass} onClick={closeNav}>Add sub category</NavLink></li>
              </ul>
            )}
          </li>

          {/* Products */}
          <li>
            <button
              type="button"
              onClick={() => toggleMenu("products")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ${
                openMenus.products ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <FaProductHunt className="w-5 h-5" />
              </span>
              <span className="flex-1">Products</span>
              {openMenus.products ? <FaAngleDown className="w-4 h-4 text-slate-400" /> : <FaAngleRight className="w-4 h-4 text-slate-400" />}
            </button>
            {openMenus.products && (
              <ul className="mt-1 ml-2 space-y-0.5 border-l border-slate-200">
                <li><NavLink to={`${BASE}/products`} end className={subLinkClass} onClick={closeNav}>Product List</NavLink></li>
                <li><NavLink to={`${BASE}/product/upload`} className={subLinkClass} onClick={closeNav}>Product Upload</NavLink></li>
                <li><NavLink to={`${BASE}/productRAMS/add`} className={subLinkClass} onClick={closeNav}>Add Product RAMS</NavLink></li>
                <li><NavLink to={`${BASE}/productWEIGHT/add`} className={subLinkClass} onClick={closeNav}>Add Product WEIGHT</NavLink></li>
                <li><NavLink to={`${BASE}/productSIZE/add`} className={subLinkClass} onClick={closeNav}>Add Product SIZE</NavLink></li>
              </ul>
            )}
          </li>

          {/* Home Main Banners */}
          <li>
            <button
              type="button"
              onClick={() => toggleMenu("mainBanners")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ${
                openMenus.mainBanners ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <TbSlideshow className="w-5 h-5" />
              </span>
              <span className="flex-1">Home Main Banners</span>
              {openMenus.mainBanners ? <FaAngleDown className="w-4 h-4 text-slate-400" /> : <FaAngleRight className="w-4 h-4 text-slate-400" />}
            </button>
            {openMenus.mainBanners && (
              <ul className="mt-1 ml-2 space-y-0.5 border-l border-slate-200">
                <li><NavLink to={`${BASE}/homeBannerSlide/list`} className={subLinkClass} onClick={closeNav}>Banner List</NavLink></li>
                <li><NavLink to={`${BASE}/homeBannerSlide/add`} className={subLinkClass} onClick={closeNav}>Banner Upload</NavLink></li>
              </ul>
            )}
          </li>

          {/* Home Slide Banners */}
          <li>
            <button
              type="button"
              onClick={() => toggleMenu("slideBanners")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ${
                openMenus.slideBanners ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <TbSlideshow className="w-5 h-5" />
              </span>
              <span className="flex-1">Home Slide Banners</span>
              {openMenus.slideBanners ? <FaAngleDown className="w-4 h-4 text-slate-400" /> : <FaAngleRight className="w-4 h-4 text-slate-400" />}
            </button>
            {openMenus.slideBanners && (
              <ul className="mt-1 ml-2 space-y-0.5 border-l border-slate-200">
                <li><NavLink to={`${BASE}/banners`} end className={subLinkClass} onClick={closeNav}>Banners List</NavLink></li>
                <li><NavLink to={`${BASE}/banners/add`} className={subLinkClass} onClick={closeNav}>Banner Upload</NavLink></li>
              </ul>
            )}
          </li>

          {/* Home Side Banners */}
          <li>
            <button
              type="button"
              onClick={() => toggleMenu("sideBanners")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ${
                openMenus.sideBanners ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <TbSlideshow className="w-5 h-5" />
              </span>
              <span className="flex-1">Home Side Banners</span>
              {openMenus.sideBanners ? <FaAngleDown className="w-4 h-4 text-slate-400" /> : <FaAngleRight className="w-4 h-4 text-slate-400" />}
            </button>
            {openMenus.sideBanners && (
              <ul className="mt-1 ml-2 space-y-0.5 border-l border-slate-200">
                <li><NavLink to={`${BASE}/homeSideBanners`} end className={subLinkClass} onClick={closeNav}>Banners List</NavLink></li>
                <li><NavLink to={`${BASE}/homeSideBanners/add`} className={subLinkClass} onClick={closeNav}>Banner Upload</NavLink></li>
              </ul>
            )}
          </li>

          {/* Home Bottom Banners */}
          <li>
            <button
              type="button"
              onClick={() => toggleMenu("bottomBanners")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ${
                openMenus.bottomBanners ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <TbSlideshow className="w-5 h-5" />
              </span>
              <span className="flex-1">Home Bottom Banners</span>
              {openMenus.bottomBanners ? <FaAngleDown className="w-4 h-4 text-slate-400" /> : <FaAngleRight className="w-4 h-4 text-slate-400" />}
            </button>
            {openMenus.bottomBanners && (
              <ul className="mt-1 ml-2 space-y-0.5 border-l border-slate-200">
                <li><NavLink to={`${BASE}/homeBottomBanners`} end className={subLinkClass} onClick={closeNav}>Banners List</NavLink></li>
                <li><NavLink to={`${BASE}/homeBottomBanners/add`} className={subLinkClass} onClick={closeNav}>Banner Upload</NavLink></li>
              </ul>
            )}
          </li>

          {/* Orders */}
          <li>
            <NavLink to={`${BASE}/orders`} end className={navLinkClass} onClick={closeNav}>
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <FaClipboardCheck className="w-5 h-5" />
              </span>
              <span>Orders</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-200">
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <IoMdLogOut className="w-5 h-5 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
